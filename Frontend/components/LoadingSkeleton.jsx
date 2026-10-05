import React from "react";

export const LoadingSkeleton = ({ rows = 5 }) => (
  <div style={{ padding: "8px 0" }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 0.7fr 1fr",
          gap: 12,
          padding: "14px 16px",
          borderBottom: "1px solid #f1f5f9",
          alignItems: "center",
        }}
      >
        <div className="skeleton" style={{ height: 14, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 14, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 14, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 14, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 14, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 22, borderRadius: 20, width: 90 }} />
        <div className="skeleton" style={{ height: 14, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 28, borderRadius: 8, width: 60 }} />
      </div>
    ))}
  </div>
);

export const StatCardSkeleton = () => (
  <div className="stat-card" style={{ gap: 0 }}>
    <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 14 }} />
    <div className="skeleton" style={{ height: 28, width: "60%", marginBottom: 8, borderRadius: 6 }} />
    <div className="skeleton" style={{ height: 14, width: "80%", marginBottom: 12, borderRadius: 6 }} />
    <div className="skeleton" style={{ height: 14, width: "50%", borderRadius: 6 }} />
  </div>
);

export const ChartSkeleton = ({ height = 300 }) => (
  <div className="skeleton" style={{ height, borderRadius: 14 }} />
);

export const CardSkeleton = ({ height = 120 }) => (
  <div className="skeleton" style={{ height, borderRadius: 14 }} />
);
