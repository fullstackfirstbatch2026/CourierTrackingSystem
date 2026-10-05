
/* =========================================================
   CourierFlow UI Upgrade
   Works with the existing Spring Boot REST API.
   API: /api/shipments and /api/tracking/{trackingNumber}
   No database schema changes required for this file.
   ========================================================= */

(() => {
    "use strict";

    const API = window.API_BASE_URL || "/api";
    const state = {
        shipments: [],
        shipmentFilter: "ALL",
        search: "",
        notificationsRead: JSON.parse(localStorage.getItem("cf_notifications_read") || "[]")
    };

    const $ = (s, root=document) => root.querySelector(s);
    const $$ = (s, root=document) => [...root.querySelectorAll(s)];

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&","&amp;").replaceAll("<","&lt;")
            .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
    }

    function titleCase(status) {
        return String(status || "UNKNOWN")
            .replaceAll("_"," ")
            .toLowerCase()
            .replace(/\b\w/g, c => c.toUpperCase());
    }

    function normalizedStatus(status) {
        const s = String(status || "").toUpperCase().replaceAll(" ","_");
        if (s.includes("DELIVER")) return "DELIVERED";
        if (s.includes("OUT_FOR") || s.includes("OUT FOR")) return "OUT_FOR_DELIVERY";
        if (s.includes("EXCEPTION") || s.includes("FAILED") || s.includes("DELAY")) return "EXCEPTION";
        if (s.includes("TRANSIT")) return "IN_TRANSIT";
        return "PENDING";
    }

    function statusBadge(status) {
        const n = normalizedStatus(status);
        const label = titleCase(n);
        return `<span class="status cf-status-${n.toLowerCase()}">${escapeHtml(label)}</span>`;
    }

    function etaFor(shipment) {
        if (shipment.expectedDeliveryDate || shipment.eta) {
            return shipment.expectedDeliveryDate || shipment.eta;
        }
        const s = normalizedStatus(shipment.status);
        if (s === "DELIVERED") return "Delivered";
        const days = { OUT_FOR_DELIVERY: 0, IN_TRANSIT: 1, PENDING: 2, EXCEPTION: 3 };
        const d = new Date();
        d.setDate(d.getDate() + (days[s] ?? 2));
        return d.toLocaleDateString("en-IN", {year:"numeric",month:"short",day:"numeric"});
    }

    function toast(message, type="info", title="CourierFlow") {
        let wrap = $(".cf-toast-wrap");
        if (!wrap) {
            wrap = document.createElement("div");
            wrap.className = "cf-toast-wrap";
            document.body.appendChild(wrap);
        }
        const icons = {success:"✓",error:"!",warning:"⚠",info:"i"};
        const el = document.createElement("div");
        el.className = `cf-toast ${type}`;
        el.innerHTML = `
      <div class="cf-toast-icon">${icons[type] || "i"}</div>
      <div class="cf-toast-body">
        <div class="cf-toast-title">${escapeHtml(title)}</div>
        <div class="cf-toast-text">${escapeHtml(message)}</div>
      </div>
      <button class="cf-toast-close" aria-label="Close">×</button>`;
        wrap.appendChild(el);
        $(".cf-toast-close", el).onclick = () => el.remove();
        setTimeout(() => {
            el.classList.add("cf-toast-out");
            setTimeout(() => el.remove(), 230);
        }, 4200);
    }

    function openModal(title, body, footer="") {
        closeModal();
        const backdrop = document.createElement("div");
        backdrop.className = "cf-modal-backdrop open";
        backdrop.id = "cfModal";
        backdrop.innerHTML = `
      <div class="cf-modal" role="dialog" aria-modal="true">
        <div class="cf-modal-head">
          <h2>${escapeHtml(title)}</h2>
          <button class="cf-modal-close" aria-label="Close">×</button>
        </div>
        <div class="cf-modal-body">${body}</div>
        ${footer ? `<div class="cf-modal-foot">${footer}</div>` : ""}
      </div>`;
        document.body.appendChild(backdrop);
        $(".cf-modal-close", backdrop).onclick = closeModal;
        backdrop.addEventListener("click", e => {
            if (e.target === backdrop) closeModal();
        });
        document.addEventListener("keydown", modalEsc, {once:true});
        return backdrop;
    }

    function modalEsc(e){ if(e.key === "Escape") closeModal(); }
    function closeModal(){ $("#cfModal")?.remove(); }

    async function getShipments() {
        const response = await fetch(`${API}/shipments`);
        if (!response.ok) throw new Error("Could not load shipments");
        return response.json();
    }

    function addPageAnimation() {
        $$(".page").forEach(p => {
            const observer = new MutationObserver(() => {
                if (p.classList.contains("active-page")) {
                    p.classList.remove("cf-page-enter");
                    void p.offsetWidth;
                    p.classList.add("cf-page-enter");
                }
            });
            observer.observe(p, {attributes:true, attributeFilter:["class"]});
        });
    }

    function makeShipmentToolbar(table) {
        const page = table.closest(".page") || table.parentElement;
        if (!page || $(".cf-filterbar", page)) return;

        const bar = document.createElement("div");
        bar.className = "cf-filterbar";
        bar.innerHTML = `
      <button class="cf-filter-btn active" data-filter="ALL">All</button>
      <button class="cf-filter-btn" data-filter="PENDING">Pending</button>
      <button class="cf-filter-btn" data-filter="IN_TRANSIT">In Transit</button>
      <button class="cf-filter-btn" data-filter="OUT_FOR_DELIVERY">Out for Delivery</button>
      <button class="cf-filter-btn" data-filter="DELIVERED">Delivered</button>
      <button class="cf-filter-btn" data-filter="EXCEPTION">Exceptions</button>
      <span class="cf-filter-spacer"></span>
      <button class="cf-export-btn" id="cfExport">↓ Export CSV</button>
    `;

        const tableWrap = table.closest("table")?.parentElement || table.parentElement;
        tableWrap?.parentElement?.insertBefore(bar, tableWrap);
        $$(".cf-filter-btn", bar).forEach(btn => {
            btn.onclick = () => {
                state.shipmentFilter = btn.dataset.filter;
                $$(".cf-filter-btn", bar).forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                renderShipments();
            };
        });
        $("#cfExport", bar).onclick = exportCSV;
    }

    function ensureShipmentHeader() {
        const table = $("#shipmentTable");
        if (!table) return;
        const head = table.closest("table")?.querySelector("thead");
        if (!head) return;
        const row = $("tr", head);
        if (!row) return;

        const existing = [...row.children].map(x => x.textContent.trim().toLowerCase());
        if (!existing.includes("eta")) {
            const th = document.createElement("th");
            th.textContent = "ETA";
            row.appendChild(th);
        }
        if (!existing.includes("actions")) {
            const th = document.createElement("th");
            th.textContent = "Actions";
            row.appendChild(th);
        }
    }

    function filteredShipments() {
        const q = state.search.toLowerCase();
        return state.shipments.filter(s => {
            const statusOk = state.shipmentFilter === "ALL" ||
                normalizedStatus(s.status) === state.shipmentFilter;
            const text = [
                s.trackingNumber,s.senderName,s.receiverName,s.origin,s.destination,s.status
            ].join(" ").toLowerCase();
            return statusOk && (!q || text.includes(q));
        });
    }

    function renderShipments() {
        const table = $("#shipmentTable");
        if (!table) return;
        ensureShipmentHeader();
        makeShipmentToolbar(table);

        const list = filteredShipments();
        if (!list.length) {
            table.innerHTML = `<tr><td colspan="99"><div class="cf-empty">
        <div class="icon">📦</div><h3>No shipments found</h3>
        <p>Try another filter or create a new shipment.</p>
      </div></td></tr>`;
            return;
        }

        table.innerHTML = list.map(s => {
            const eta = etaFor(s);
            const status = normalizedStatus(s.status);
            return `<tr data-shipment-id="${escapeHtml(s.id)}">
        <td>${escapeHtml(s.id ?? "-")}</td>
        <td><strong class="tracking-link" data-track="${escapeHtml(s.trackingNumber)}">${escapeHtml(s.trackingNumber ?? "-")}</strong></td>
        <td>${escapeHtml(s.senderName ?? "-")}</td>
        <td>${escapeHtml(s.receiverName ?? "-")}</td>
        <td><div class="cf-route"><span>${escapeHtml(s.origin ?? "-")}</span><span class="cf-route-arrow">→</span><span>${escapeHtml(s.destination ?? "-")}</span></div></td>
        <td>${statusBadge(status)}</td>
        <td><span class="cf-eta ${status==="DELIVERED" ? "delivered" : ""}">◷ ${escapeHtml(eta)}</span></td>
        <td>${actionMenu(s)}</td>
      </tr>`;
        }).join("");

        $$(".tracking-link", table).forEach(el => {
            el.style.cursor="pointer";
            el.onclick=()=>openTracking(el.dataset.track);
        });
        $$(".cf-action-trigger", table).forEach(btn => {
            btn.onclick = e => {
                e.stopPropagation();
                const menu = btn.nextElementSibling;
                $$(".cf-action-menu.open").forEach(m => { if(m!==menu)m.classList.remove("open"); });
                menu.classList.toggle("open");
            };
        });
        $$(".cf-view", table).forEach(b => b.onclick=()=>viewShipment(Number(b.dataset.id)));
        $$(".cf-edit", table).forEach(b => b.onclick=()=>editShipment(Number(b.dataset.id)));
        $$(".cf-track", table).forEach(b => b.onclick=()=>openTracking(b.dataset.track));
        $$(".cf-delete", table).forEach(b => b.onclick=()=>deleteShipmentUpgrade(Number(b.dataset.id)));
    }

    function actionMenu(s) {
        return `<div class="cf-action-wrap">
      <button class="cf-action-trigger" title="Shipment actions">⋯</button>
      <div class="cf-action-menu">
        <button class="cf-view" data-id="${escapeHtml(s.id)}">◉ View details</button>
        <button class="cf-track" data-track="${escapeHtml(s.trackingNumber)}">⌕ Track shipment</button>
        <button class="cf-edit" data-id="${escapeHtml(s.id)}">✎ Edit shipment</button>
        <button class="cf-delete danger" data-id="${escapeHtml(s.id)}">⌫ Delete shipment</button>
      </div>
    </div>`;
    }

    function viewShipment(id) {
        const s = state.shipments.find(x => Number(x.id) === id);
        if (!s) return;
        openModal(`Shipment ${s.trackingNumber || ""}`, `
      <div class="cf-modal-grid">
        ${detail("Tracking Number",s.trackingNumber)}
        ${detail("Status",titleCase(s.status))}
        ${detail("Sender",s.senderName)}
        ${detail("Receiver",s.receiverName)}
        ${detail("Origin",s.origin)}
        ${detail("Destination",s.destination)}
        ${detail("Estimated Delivery",etaFor(s))}
        ${detail("Shipment ID",s.id)}
      </div>
      <div style="margin-top:18px" class="cf-notice">
        ETA is currently presentation-only. To store a real ETA in MySQL, add an ETA field to the Shipment entity and database.
      </div>`,
            `<button class="cf-btn" onclick="closeModal()">Close</button>
       <button class="cf-btn primary" onclick="openTracking('${escapeHtml(s.trackingNumber)}')">Track Shipment</button>`);
    }

    function detail(label,value){
        return `<div class="cf-field"><label>${escapeHtml(label)}</label><div style="font-weight:750">${escapeHtml(value ?? "-")}</div></div>`;
    }

    function editShipment(id) {
        const s = state.shipments.find(x => Number(x.id) === id);
        if (!s) return;
        const modal = openModal(`Edit ${s.trackingNumber || "Shipment"}`, `
      <div class="cf-modal-grid">
        <div class="cf-field"><label>Tracking Number</label><input id="cfEditTracking" value="${escapeHtml(s.trackingNumber)}"></div>
        <div class="cf-field"><label>Status</label>
          <select id="cfEditStatus">
            ${["PENDING","IN_TRANSIT","OUT_FOR_DELIVERY","DELIVERED","EXCEPTION"].map(v =>
                `<option value="${v}" ${normalizedStatus(s.status)===v?"selected":""}>${titleCase(v)}</option>`).join("")}
          </select>
        </div>
        <div class="cf-field"><label>Sender</label><input id="cfEditSender" value="${escapeHtml(s.senderName)}"></div>
        <div class="cf-field"><label>Receiver</label><input id="cfEditReceiver" value="${escapeHtml(s.receiverName)}"></div>
        <div class="cf-field"><label>Origin</label><input id="cfEditOrigin" value="${escapeHtml(s.origin)}"></div>
        <div class="cf-field"><label>Destination</label><input id="cfEditDestination" value="${escapeHtml(s.destination)}"></div>
      </div>`,
            `<button class="cf-btn" onclick="closeModal()">Cancel</button>
       <button class="cf-btn primary" id="cfSaveEdit">Save Changes</button>`);

        $("#cfSaveEdit", modal).onclick = async () => {
            const payload = {
                trackingNumber: $("#cfEditTracking").value.trim(),
                senderName: $("#cfEditSender").value.trim(),
                receiverName: $("#cfEditReceiver").value.trim(),
                origin: $("#cfEditOrigin").value.trim(),
                destination: $("#cfEditDestination").value.trim(),
                status: $("#cfEditStatus").value
            };
            try {
                const res = await fetch(`${API}/shipments/${id}`,{
                    method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)
                });
                if(!res.ok) throw new Error("Update failed");
                closeModal();
                toast("Shipment updated successfully.","success","Saved");
                await refreshAll();
            } catch(e) {
                toast("The shipment could not be updated. Check the Spring Boot API.","error","Update failed");
            }
        };
    }

    async function deleteShipmentUpgrade(id) {
        const s = state.shipments.find(x => Number(x.id) === id);
        if (!s) return;
        const modal = openModal("Delete shipment",`
      <div class="cf-notice" style="border-color:#fecaca;background:#fff5f5;color:#991b1b">
        This will permanently delete <strong>${escapeHtml(s.trackingNumber)}</strong> from the database.
      </div>`,
            `<button class="cf-btn" onclick="closeModal()">Cancel</button>
       <button class="cf-btn danger" id="cfConfirmDelete">Delete Shipment</button>`);
        $("#cfConfirmDelete",modal).onclick=async()=>{
            try{
                const res=await fetch(`${API}/shipments/${id}`,{method:"DELETE"});
                if(!res.ok)throw new Error();
                closeModal();
                toast("Shipment deleted.","success","Deleted");
                await refreshAll();
            }catch(e){
                toast("Delete failed. Check the backend endpoint.","error","Delete failed");
            }
        };
    }

    function openTracking(tracking) {
        const input = $("#trackingSearch");
        if (input) input.value = tracking || "";
        if (typeof window.showPage === "function") window.showPage("tracking");
        setTimeout(() => {
            if (typeof window.trackShipment === "function") window.trackShipment();
            else toast(`Tracking ${tracking}`,"info","Track");
        }, 80);
    }

    function exportCSV() {
        const list = filteredShipments();
        if(!list.length){toast("There are no shipments to export.","warning","Export");return;}
        const rows=[
            ["ID","Tracking Number","Sender","Receiver","Origin","Destination","Status","ETA"],
            ...list.map(s=>[s.id,s.trackingNumber,s.senderName,s.receiverName,s.origin,s.destination,titleCase(s.status),etaFor(s)])
        ];
        const csv=rows.map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");
        const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
        const a=document.createElement("a");
        a.href=URL.createObjectURL(blob);
        a.download=`courierflow-shipments-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast(`${list.length} shipment(s) exported.`,"success","Export complete");
    }

    function updateDashboardStats() {
        const total=state.shipments.length;
        const transit=state.shipments.filter(s=>normalizedStatus(s.status)==="IN_TRANSIT").length;
        const delivered=state.shipments.filter(s=>normalizedStatus(s.status)==="DELIVERED").length;
        const exceptions=state.shipments.filter(s=>normalizedStatus(s.status)==="EXCEPTION").length;
        const out=state.shipments.filter(s=>normalizedStatus(s.status)==="OUT_FOR_DELIVERY").length;
        const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
        set("totalShipments",total);
        set("inTransit",transit);
        set("delivered",delivered);
        set("exceptionsCount",exceptions);
        set("outForDelivery",out);
    }

    async function refreshAll() {
        try {
            state.shipments = await getShipments();
            updateDashboardStats();
            renderShipments();
            if(typeof window.loadDashboard==="function") {
                try{ await window.loadDashboard(); }catch(_){}
            }
        } catch(e) {
            toast("Could not reach the Spring Boot API at /api/shipments.","error","Backend unavailable");
        }
    }

    function wireGlobalSearch() {
        const input=$("#globalSearch");
        if(!input)return;
        let timer;
        input.addEventListener("input",()=>{
            clearTimeout(timer);
            timer=setTimeout(()=>{
                state.search=input.value.trim();
                const page=$("#shipments");
                if(page && state.search && typeof window.showPage==="function") window.showPage("shipments");
                renderShipments();
            },120);
        });
        input.addEventListener("keydown",e=>{
            if(e.key==="Enter" && state.search){
                if(typeof window.showPage==="function")window.showPage("shipments");
                renderShipments();
            }
        });
    }

    function wireHeaderButtons() {
        const notificationCandidates=$$('[title*="Notification"], [aria-label*="Notification"], .notification-btn, .notifications-btn');
        notificationCandidates.forEach(b=>b.addEventListener("click",()=>{
            if(typeof window.showPage==="function")window.showPage("notifications");
        }));

        const helpCandidates=$$('[title*="Help"], [aria-label*="Help"], .help-btn');
        helpCandidates.forEach(b=>b.addEventListener("click",()=>showHelp()));

        $$("button").forEach(btn=>{
            const text=btn.textContent.trim().toLowerCase();
            if(text==="refresh" || text.includes("refresh")){
                btn.addEventListener("click",async()=>{
                    await refreshAll();
                    toast("Dashboard data refreshed.","success","Refresh");
                });
            }
            if(text.includes("new shipment") || text.includes("add shipment")){
                btn.addEventListener("click",()=>{
                    if(typeof window.showPage==="function")window.showPage("add-shipment");
                });
            }
        });
    }

    function showHelp(){
        openModal("CourierFlow Help",`
      <div class="cf-modal-grid">
        ${detail("Track","Use the Track Shipment page or click any tracking ID.")}
        ${detail("Search","Use the top search box to find by tracking ID, sender, receiver or route.")}
        ${detail("Actions","Open the ⋯ menu on a shipment to view, edit, track or delete it.")}
        ${detail("Export","Shipments → Export CSV downloads the currently filtered records.")}
      </div>
      <div class="cf-notice" style="margin-top:18px">
        Keyboard shortcut: press <strong>/</strong> to focus global search and <strong>Esc</strong> to close a dialog.
      </div>`,
            `<button class="cf-btn primary" onclick="closeModal()">Got it</button>`);
    }

    function wireKeyboard(){
        document.addEventListener("keydown",e=>{
            if(e.key==="/" && !["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName)){
                e.preventDefault();$("#globalSearch")?.focus();
            }
            if(e.key==="Escape") closeModal();
        });
    }

    function wireSidebarCollapse(){
        const candidates=$$("button, a, .menu-item");
        candidates.forEach(el=>{
            const t=el.textContent.trim().toLowerCase();
            if(t==="collapse"){
                el.addEventListener("click",()=>{
                    document.body.classList.toggle("cf-sidebar-collapsed");
                    localStorage.setItem("cf_sidebar_collapsed",
                        document.body.classList.contains("cf-sidebar-collapsed")?"1":"0");
                });
            }
        });
        if(localStorage.getItem("cf_sidebar_collapsed")==="1")
            document.body.classList.add("cf-sidebar-collapsed");
    }

    function addUpgradeStylesForStatus(){
        const style=document.createElement("style");
        style.textContent=`
      .status.cf-status-delivered{color:#059669;background:#ecfdf5;border-color:#bbf7d0}
      .status.cf-status-in_transit{color:#2563eb;background:#eff6ff;border-color:#bfdbfe}
      .status.cf-status-out_for_delivery{color:#d97706;background:#fffbeb;border-color:#fde68a}
      .status.cf-status-exception{color:#dc2626;background:#fef2f2;border-color:#fecaca}
      .status.cf-status-pending{color:#64748b;background:#f8fafc;border-color:#e2e8f0}
      .cf-sidebar-collapsed .sidebar{width:82px}
      .cf-sidebar-collapsed .main-content{margin-left:82px}
      .cf-sidebar-collapsed .sidebar .brand-text,
      .cf-sidebar-collapsed .sidebar .menu-label,
      .cf-sidebar-collapsed .sidebar .menu-item span:not(.icon),
      .cf-sidebar-collapsed .sidebar .collapse-text{display:none}
      .cf-sidebar-collapsed .sidebar .menu-item{justify-content:center}
    `;
        document.head.appendChild(style);
    }

    document.addEventListener("DOMContentLoaded",async()=>{
        addUpgradeStylesForStatus();
        addPageAnimation();
        wireGlobalSearch();
        wireHeaderButtons();
        wireKeyboard();
        wireSidebarCollapse();

        // Expose useful functions for existing HTML onclick handlers.
        window.cfToast=toast;
        window.cfViewShipment=viewShipment;
        window.cfEditShipment=editShipment;
        window.cfDeleteShipment=deleteShipmentUpgrade;
        window.cfOpenTracking=openTracking;
        window.cfExportCSV=exportCSV;
        window.cfCloseModal=closeModal;

        await refreshAll();
    });
})();
