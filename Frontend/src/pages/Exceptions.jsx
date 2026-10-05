import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, MapPin, Phone, Clock, Truck, Eye, RefreshCw } from "lucide-react";
import { getExceptions } from "../services/api";
import { CardSkeleton } from "../components/LoadingSkeleton";
import { useToast } from "../components/ToastProvider";

const SEVERITY_STYLE = {
  high: { bg: "#fef2f2", border: "#fecaca", color: "#dc2626", label: "High" },
  medium: { bg: "#fffbeb", border: "#fde68a", color: "#d97706", label: "Medium" },
  low: { bg: "#eff6ff", border: "#bfdbfe", color: "#2563eb", label: "Low" },
};

const ISSUE_ICONS = {
  "Address Issue": <MapPin size={18} />,
  "Delivery Delayed": <Clock size={18} />,
  "Customer Unavailable": <Phone size={18} />,
  "Damaged Package": <AlertTriangle size={18} />,
  "Failed Delivery": <AlertTriangle size={18} />,
};

export default function Exceptions() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    getExceptions().then((data) => { setExceptions(data); setLoading(false); });
  }, []);

  const issues = ["All", ...new Set(exceptions.map((e) => e.issue))];
  const filtered = filter === "All" ? exceptions : exceptions.filter((e) => e.issue === filter);

  const handleResolve = (ex) => {
    showToast(`Exception for ${ex.trackingId} marked as resolved`, "success");
    setExceptions((prev) => prev.filter((e) => e.id !== ex.id));
  };

  const summary = {
    high: exceptions.filter((e) => e.severity === "high").length,
    medium: exceptions.filter((e) => e.severity === "medium").length,
    low: exceptions.filter((e) => e.severity === "low").length,
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Exceptions</h1>
          <p className="page-subtitle">Shipments requiring immediate attention</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { setLoading(true); getExceptions().then((d) => { setExceptions(d); setLoading(false); }); }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="grid-3" style={{ marginBottom: 24 }}>
          {[
            { key: "high", label: "High Priority", icon: <AlertTriangle size={18} /> },
            { key: "medium", label: "Medium Priority", icon: <Clock size={18} /> },
            { key: "low", label: "Low Priority", icon: <Truck size={18} /> },
          ].map(({ key, label, icon }) => {
            const s = SEVERITY_STYLE[key];
            return (
              <div key={key} className="card" style={{ padding: 20, border: `1px solid ${s.border}`, background: s.bg }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{summary[key]}</div>
                    <div style={{ fontSize: 12.5, color: "#64748b" }}>{label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {issues.map((issue) => (
          <button
            key={issue}
            className={`btn btn-sm ${filter === issue ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilter(issue)}
            aria-pressed={filter === issue}
          >
            {issue}
            {issue !== "All" && (
              <span style={{ marginLeft: 4, fontSize: 11, opacity: 0.8 }}>
                ({exceptions.filter((e) => e.issue === issue).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Exception Cards */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} height={100} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><AlertTriangle size={28} /></div>
            <p style={{ fontWeight: 600 }}>No exceptions found</p>
            <p style={{ fontSize: 13 }}>All shipments are on track</p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((ex) => {
            const s = SEVERITY_STYLE[ex.severity];
            const icon = ISSUE_ICONS[ex.issue] || <AlertTriangle size={18} />;
            return (
              <div
                key={ex.id}
                className="exception-card"
                style={{ borderColor: s.border, background: "#fff" }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: s.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: s.color,
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14, color: "#2563eb" }}>{ex.trackingId}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                      {s.label}
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b" }}>{ex.issue}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>{ex.description}</p>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#94a3b8", flexWrap: "wrap" }}>
                    <span><strong style={{ color: "#64748b" }}>Customer:</strong> {ex.customer}</span>
                    <span><strong style={{ color: "#64748b" }}>Courier:</strong> {ex.courier}</span>
                    <span><strong style={{ color: "#64748b" }}>Route:</strong> {ex.origin} → {ex.destination}</span>
                    <span><Clock size={11} style={{ verticalAlign: "middle" }} /> {ex.reportedAt}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/track?id=${ex.trackingId}`)}
                    title="Track"
                    aria-label={`Track ${ex.trackingId}`}
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleResolve(ex)}
                    aria-label={`Resolve ${ex.trackingId}`}
                  >
                    Resolve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
