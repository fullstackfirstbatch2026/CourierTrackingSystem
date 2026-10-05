import React, { useState, useEffect } from "react";
import {
  Bell, CheckCircle, Truck, AlertTriangle, Package,
  Clock, MapPin, Check, CheckCheck, RefreshCw,
} from "lucide-react";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../services/api";
import { useToast } from "../components/ToastProvider";

const TYPE_CONFIG = {
  delivered: { icon: <CheckCircle size={18} />, color: "#10b981", bg: "#f0fdf4" },
  out_for_delivery: { icon: <Truck size={18} />, color: "#ea580c", bg: "#fff7ed" },
  exception: { icon: <AlertTriangle size={18} />, color: "#ef4444", bg: "#fef2f2" },
  new_shipment: { icon: <Package size={18} />, color: "#2563eb", bg: "#eff6ff" },
  delayed: { icon: <Clock size={18} />, color: "#f59e0b", bg: "#fffbeb" },
  in_transit: { icon: <MapPin size={18} />, color: "#06b6d4", bg: "#ecfeff" },
};

export default function Notifications() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    getNotifications().then((data) => { setNotifications(data); setLoading(false); });
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filters = ["All", "Unread", "Read"];
  const filtered = filter === "Unread" ? notifications.filter((n) => !n.read)
    : filter === "Read" ? notifications.filter((n) => n.read)
    : notifications;

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read", "success");
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
              <CheckCheck size={14} /> Mark All Read
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => { setLoading(true); getNotifications().then((d) => { setNotifications(d); setLoading(false); }); }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {filters.map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
          >
            {f}
            {f === "Unread" && unreadCount > 0 && (
              <span style={{ marginLeft: 4, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 10 }}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="skeleton" style={{ height: 14, width: "60%" }} />
                  <div className="skeleton" style={{ height: 12, width: "80%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Bell size={28} /></div>
            <p style={{ fontWeight: 600 }}>No notifications</p>
            <p style={{ fontSize: 13 }}>You're all caught up!</p>
          </div>
        ) : (
          filtered.map((notif) => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.new_shipment;
            return (
              <div
                key={notif.id}
                className={`notif-card ${!notif.read ? "unread" : ""}`}
                onClick={() => !notif.read && handleMarkRead(notif.id)}
                role="listitem"
                aria-label={`${notif.title}: ${notif.message}`}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: config.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: config.color,
                    flexShrink: 0,
                  }}
                >
                  {config.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <p style={{ fontSize: 14, fontWeight: notif.read ? 500 : 700, color: "#1e293b" }}>{notif.title}</p>
                    {!notif.read && (
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563eb", flexShrink: 0 }} />
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>{notif.message}</p>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>
                    <Clock size={11} style={{ verticalAlign: "middle", marginRight: 4 }} />
                    {notif.time}
                  </p>
                </div>
                {!notif.read && (
                  <button
                    className="btn btn-secondary btn-sm btn-icon"
                    onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                    title="Mark as read"
                    aria-label="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
