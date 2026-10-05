import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search, Filter, RefreshCw, Download, ChevronLeft, ChevronRight,
  Eye, Edit2, Trash2, MapPin, MoreVertical, X, ChevronDown,
} from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { useToast } from "../components/ToastProvider";
import { getShipments, deleteShipment, updateShipment } from "../services/api";
import { mockCouriers } from "../data/mockData";

const STATUS_OPTIONS = ["All", "In Transit", "Out for Delivery", "Delivered", "Exception", "Pending"];
const COURIER_OPTIONS = ["All", ...mockCouriers.map((c) => c.name)];
const PAGE_SIZE = 8;

const ConfirmDialog = ({ open, onConfirm, onCancel, trackingId }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h3 className="modal-title" id="confirm-title">Confirm Delete</h3>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onCancel} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, color: "#475569" }}>
            Are you sure you want to delete shipment <strong>{trackingId}</strong>? This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
};

const ShipmentDetailModal = ({ shipment, onClose, onEdit }) => {
  if (!shipment) return null;
  const fields = [
    ["Tracking ID", <span style={{ fontFamily: "monospace", color: "#2563eb", fontWeight: 700 }}>{shipment.trackingId}</span>],
    ["Customer", shipment.customer],
    ["Customer Phone", shipment.customerPhone],
    ["Courier", shipment.courier],
    ["Status", <StatusBadge status={shipment.status} />],
    ["Origin", shipment.origin],
    ["Destination", shipment.destination],
    ["Created Date", shipment.createdDate],
    ["ETA", shipment.eta],
    ["Package Type", shipment.packageType],
    ["Weight", shipment.weight],
    ["Payment Type", shipment.paymentType],
    ["Sender", shipment.senderName],
    ["Sender Phone", shipment.senderPhone],
    ["Sender Address", shipment.senderAddress],
    ["Receiver Address", shipment.receiverAddress],
    ["Instructions", shipment.specialInstructions || "None"],
  ];
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div className="modal" style={{ maxWidth: 620 }}>
        <div className="modal-header">
          <h3 className="modal-title" id="detail-title">Shipment Details</h3>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
            {fields.map(([label, value]) => (
              <div key={label} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13.5, color: "#1e293b", fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={() => { onEdit(shipment); onClose(); }}>
            <Edit2 size={14} /> Edit
          </button>
        </div>
      </div>
    </div>
  );
};

const EditModal = ({ shipment, onClose, onSave }) => {
  const [form, setForm] = useState(shipment ? { ...shipment } : {});
  if (!shipment) return null;
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-title">
      <div className="modal" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <h3 className="modal-title" id="edit-title">Edit Shipment – {shipment.trackingId}</h3>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { label: "Customer Name", key: "customer" },
              { label: "Customer Phone", key: "customerPhone" },
              { label: "Origin", key: "origin" },
              { label: "Destination", key: "destination" },
            ].map(({ label, key }) => (
              <div className="form-group" key={key}>
                <label className="form-label" htmlFor={`edit-${key}`}>{label}</label>
                <input id={`edit-${key}`} className="form-input" value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-status">Status</label>
              <select id="edit-status" className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.filter((s) => s !== "All").map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-eta">ETA</label>
              <input id="edit-eta" className="form-input" value={form.eta || ""} onChange={(e) => setForm({ ...form, eta: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default function Shipments() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const params = new URLSearchParams(location.search);

  const [shipments, setShipments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get("search") || "");
  const [status, setStatus] = useState("All");
  const [courier, setCourier] = useState("All");
  const [sort, setSort] = useState("date_desc");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [actionMenuId, setActionMenuId] = useState(null);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getShipments({ search, status, courier, sort, page, pageSize: PAGE_SIZE });
      setShipments(res.data);
      setTotal(res.total);
    } catch {
      showToast("Failed to load shipments", "error");
    } finally {
      setLoading(false);
    }
  }, [search, status, courier, sort, page]);

  useEffect(() => { fetchShipments(); }, [fetchShipments]);

  const handleDelete = async () => {
    try {
      await deleteShipment(deleteTarget.id);
      showToast(`Shipment ${deleteTarget.trackingId} deleted`, "success");
      setDeleteTarget(null);
      fetchShipments();
    } catch {
      showToast("Failed to delete shipment", "error");
    }
  };

  const handleSaveEdit = async (data) => {
    try {
      await updateShipment(data.id, data);
      showToast(`Shipment ${data.trackingId} updated`, "success");
      setEditTarget(null);
      fetchShipments();
    } catch {
      showToast("Failed to update shipment", "error");
    }
  };

  const handleExport = () => {
    const csv = [
      ["Tracking ID", "Customer", "Courier", "Origin", "Destination", "Status", "Created Date", "ETA"],
      ...shipments.map((s) => [s.trackingId, s.customer, s.courier, s.origin, s.destination, s.status, s.createdDate, s.eta]),
    ].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "shipments.csv"; a.click();
    URL.revokeObjectURL(url);
    showToast("Shipments exported as CSV", "success");
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="page-container">
      <ConfirmDialog
        open={!!deleteTarget}
        trackingId={deleteTarget?.trackingId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <ShipmentDetailModal shipment={viewTarget} onClose={() => setViewTarget(null)} onEdit={setEditTarget} />
      <EditModal shipment={editTarget} onClose={() => setEditTarget(null)} onSave={handleSaveEdit} />

      {/* Header */}
      <div className="page-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Shipments</h1>
          <p className="page-subtitle">Manage and monitor all your shipments</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExport}><Download size={14} /> Export</button>
          <button className="btn btn-secondary btn-sm" onClick={fetchShipments}><RefreshCw size={14} /> Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/add-shipment")}>+ New Shipment</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <div className="filters-bar">
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="Search by ID, customer, city..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                aria-label="Search shipments"
                id="shipment-search"
              />
            </div>

            <select className="form-select" style={{ width: "auto" }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter by status">
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>

            <select className="form-select" style={{ width: "auto" }} value={courier} onChange={(e) => { setCourier(e.target.value); setPage(1); }} aria-label="Filter by courier">
              {COURIER_OPTIONS.map((c) => <option key={c}>{c}</option>)}
            </select>

            <select className="form-select" style={{ width: "auto" }} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort order">
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
            </select>

            {(search || status !== "All" || courier !== "All") && (
              <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(""); setStatus("All"); setCourier("All"); setPage(1); }}>
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ padding: "12px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#64748b" }}>{loading ? "Loading..." : `${total} shipments found`}</span>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <LoadingSkeleton rows={PAGE_SIZE} />
          ) : shipments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Search size={28} /></div>
              <p style={{ fontWeight: 600 }}>No shipments found</p>
              <p style={{ fontSize: 13 }}>Try adjusting your filters</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Customer</th>
                  <th>Courier</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>ETA</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span
                        style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: "#2563eb", cursor: "pointer" }}
                        onClick={() => navigate(`/track?id=${s.trackingId}`)}
                        title="Click to track"
                      >
                        {s.trackingId}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13.5 }}>{s.customer}</div>
                      <div style={{ fontSize: 11.5, color: "#94a3b8" }}>{s.customerPhone}</div>
                    </td>
                    <td style={{ fontSize: 13, color: "#475569" }}>{s.courier}</td>
                    <td style={{ fontSize: 13 }}>{s.origin}</td>
                    <td style={{ fontSize: 13 }}>{s.destination}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td style={{ fontSize: 12, color: "#94a3b8" }}>{s.createdDate}</td>
                    <td style={{ fontSize: 13 }}>
                      {s.status === "Delivered"
                        ? <span style={{ color: "#10b981", fontWeight: 600 }}>Delivered</span>
                        : s.eta}
                    </td>
                    <td>
                      <div style={{ position: "relative" }}>
                        <button
                          className="btn btn-secondary btn-sm btn-icon"
                          onClick={() => setActionMenuId(actionMenuId === s.id ? null : s.id)}
                          aria-label="Actions"
                          aria-haspopup="true"
                          aria-expanded={actionMenuId === s.id}
                        >
                          <MoreVertical size={15} />
                        </button>
                        {actionMenuId === s.id && (
                          <div className="dropdown-menu" style={{ right: 0, minWidth: 140, top: "calc(100% + 4px)" }} role="menu">
                            <div className="dropdown-item" role="menuitem" onClick={() => { setViewTarget(s); setActionMenuId(null); }}>
                              <Eye size={14} /> View
                            </div>
                            <div className="dropdown-item" role="menuitem" onClick={() => { navigate(`/track?id=${s.trackingId}`); setActionMenuId(null); }}>
                              <MapPin size={14} /> Track
                            </div>
                            <div className="dropdown-item" role="menuitem" onClick={() => { setEditTarget(s); setActionMenuId(null); }}>
                              <Edit2 size={14} /> Edit
                            </div>
                            <div className="dropdown-divider" />
                            <div className="dropdown-item danger" role="menuitem" onClick={() => { setDeleteTarget(s); setActionMenuId(null); }}>
                              <Trash2 size={14} /> Delete
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>
              Page {page} of {totalPages}
            </span>
            <div className="pagination">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)} aria-label="Previous page">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`page-btn ${page === p ? "active" : ""}`} onClick={() => setPage(p)} aria-label={`Page ${p}`} aria-current={page === p ? "page" : undefined}>{p}</button>
              ))}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} aria-label="Next page">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
