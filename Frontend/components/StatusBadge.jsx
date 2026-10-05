import React from "react";

export const StatusBadge = ({ status }) => {
  const classMap = {
    "In Transit": "badge badge-in-transit",
    "Out for Delivery": "badge badge-out-for-delivery",
    "Delivered": "badge badge-delivered",
    "Exception": "badge badge-exception",
    "Pending": "badge badge-pending",
    "Cancelled": "badge badge-cancelled",
  };
  const dotColor = {
    "In Transit": "#2563eb",
    "Out for Delivery": "#ea580c",
    "Delivered": "#16a34a",
    "Exception": "#dc2626",
    "Pending": "#78716c",
    "Cancelled": "#9333ea",
  };

  return (
    <span className={classMap[status] || "badge badge-pending"}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: dotColor[status] || "#78716c",
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
};
