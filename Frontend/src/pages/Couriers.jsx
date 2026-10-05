import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, ArrowRight, Package, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { getCouriers } from "../services/api";
import { CardSkeleton } from "../components/LoadingSkeleton";

const COLORS = {
  "Blue Dart": "#1e40af",
  "Delhivery": "#dc2626",
  "DTDC": "#ea580c",
  "India Post": "#15803d",
  "FedEx": "#7c3aed",
  "DHL": "#ca8a04",
  "Ekart": "#0891b2",
};

const CourierCard = ({ courier, onViewShipments }) => {
  const color = COLORS[courier.name] || "#2563eb";
  const successRate = courier.successRate || Math.round((courier.delivered / courier.totalShipments) * 100);

  return (
    <div className="courier-card">
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          className="courier-avatar"
          style={{ background: color }}
          aria-label={courier.name}
        >
          {courier.code}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{courier.name}</h3>
          <p style={{ fontSize: 12.5, color: "#94a3b8" }}>
            Avg delivery: {courier.avgDelivery}
          </p>
        </div>
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: successRate >= 88 ? "#10b981" : successRate >= 80 ? "#f59e0b" : "#ef4444",
          background: successRate >= 88 ? "#f0fdf4" : successRate >= 80 ? "#fffbeb" : "#fef2f2",
          padding: "4px 10px",
          borderRadius: 20,
        }}>
          {successRate}%
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {[
          { label: "Total", value: courier.totalShipments, color: "#64748b" },
          { label: "Delivered", value: courier.delivered, color: "#10b981" },
          { label: "In Transit", value: courier.inTransit, color: "#2563eb" },
        ].map(({ label, value, color: c }) => (
          <div key={label} style={{ textAlign: "center", background: "#f8fafc", borderRadius: 8, padding: "10px 6px" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: c }}>{value}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Success rate bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 12, color: "#64748b" }}>Delivery success rate</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{successRate}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${successRate}%`,
              background: successRate >= 88
                ? "linear-gradient(90deg, #10b981, #059669)"
                : successRate >= 80
                ? "linear-gradient(90deg, #f59e0b, #d97706)"
                : "linear-gradient(90deg, #ef4444, #dc2626)",
            }}
          />
        </div>
      </div>

      {/* Exception badge */}
      {courier.exceptions > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#ef4444" }}>
          <AlertTriangle size={13} />
          {courier.exceptions} active {courier.exceptions === 1 ? "exception" : "exceptions"}
        </div>
      )}

      <button
        className="btn btn-secondary w-full"
        onClick={() => onViewShipments(courier.name)}
        style={{ justifyContent: "center" }}
      >
        View Shipments <ArrowRight size={14} />
      </button>
    </div>
  );
};

export default function Couriers() {
  const navigate = useNavigate();
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCouriers().then((data) => { setCouriers(data); setLoading(false); });
  }, []);

  const totalStats = couriers.reduce(
    (acc, c) => ({
      total: acc.total + c.totalShipments,
      delivered: acc.delivered + c.delivered,
      inTransit: acc.inTransit + c.inTransit,
      exceptions: acc.exceptions + c.exceptions,
    }),
    { total: 0, delivered: 0, inTransit: 0, exceptions: 0 }
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Courier Services</h1>
        <p className="page-subtitle">Monitor performance across all courier partners</p>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: "Total Shipments", value: totalStats.total, icon: <Package size={18} />, color: "#2563eb", bg: "#eff6ff" },
            { label: "Delivered", value: totalStats.delivered, icon: <CheckCircle size={18} />, color: "#10b981", bg: "#f0fdf4" },
            { label: "In Transit", value: totalStats.inTransit, icon: <Truck size={18} />, color: "#06b6d4", bg: "#ecfeff" },
            { label: "Exceptions", value: totalStats.exceptions, icon: <AlertTriangle size={18} />, color: "#ef4444", bg: "#fef2f2" },
          ].map(({ label, value, icon, color, bg }) => (
            <div className="card" key={label} style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}>{value.toLocaleString()}</div>
                  <div style={{ fontSize: 12.5, color: "#94a3b8" }}>{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Courier Cards */}
      <div className="grid-3">
        {loading
          ? Array.from({ length: 7 }).map((_, i) => <CardSkeleton key={i} height={260} />)
          : couriers.map((courier) => (
              <CourierCard
                key={courier.id}
                courier={courier}
                onViewShipments={(name) => navigate(`/shipments?courier=${encodeURIComponent(name)}`)}
              />
            ))
        }
      </div>
    </div>
  );
}
