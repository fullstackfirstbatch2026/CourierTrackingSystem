import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search, Package, Truck, MapPin, CheckCircle,
  Clock, AlertTriangle, Loader2, ArrowRight,
  Calendar, User, Navigation,
} from "lucide-react";
import { useToast } from "../components/ToastProvider";
import { trackShipment } from "../services/api";

const STEP_ICONS = {
  "Order Placed": <Package size={16} />,
  "Picked Up": <Truck size={16} />,
  "In Transit": <Navigation size={16} />,
  "Reached Local Hub": <MapPin size={16} />,
  "Out for Delivery": <Truck size={16} />,
  "Delivered": <CheckCircle size={16} />,
};

const TimelineStep = ({ step, index, isLast }) => {
  const icon = STEP_ICONS[step.label] || <MapPin size={16} />;
  return (
    <div className="timeline-item" style={{ paddingBottom: isLast ? 0 : 0 }}>
      <div>
        <div className={`timeline-dot ${step.status}`} title={step.status}>
          {step.status === "completed" && <CheckCircle size={16} />}
          {step.status === "active" && icon}
          {step.status === "upcoming" && icon}
        </div>
        {!isLast && (
          <div style={{
            width: 2,
            height: 40,
            margin: "4px auto",
            background: step.status === "completed"
              ? "#10b981"
              : step.status === "active"
              ? "linear-gradient(180deg, #2563eb, #e2e8f0)"
              : "#e2e8f0",
            borderRadius: 2,
          }} />
        )}
      </div>
      <div style={{ paddingBottom: isLast ? 0 : 8, paddingTop: 8 }}>
        <p style={{
          fontSize: 14,
          fontWeight: step.status === "upcoming" ? 400 : 600,
          color: step.status === "upcoming" ? "#94a3b8" : step.status === "active" ? "#2563eb" : "#1e293b",
          marginBottom: 3,
        }}>
          {step.label}
          {step.status === "active" && (
            <span style={{ marginLeft: 8, fontSize: 11, background: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
              Current
            </span>
          )}
        </p>
        <p style={{ fontSize: 12.5, color: step.status === "upcoming" ? "#cbd5e1" : "#64748b" }}>
          <Clock size={11} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
          {step.time}
        </p>
        <p style={{ fontSize: 12.5, color: step.status === "upcoming" ? "#cbd5e1" : "#94a3b8", marginTop: 2 }}>
          <MapPin size={11} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
          {step.location}
        </p>
      </div>
    </div>
  );
};

const RECENT_KEY = "cf_recent_tracks";
const getRecent = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); }
  catch { return []; }
};
const addRecent = (id) => {
  const current = getRecent().filter((x) => x !== id).slice(0, 4);
  localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...current]));
};

export default function TrackShipment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const inputRef = useRef(null);
  const params = new URLSearchParams(location.search);
  const prefill = params.get("id") || "";

  const [query, setQuery] = useState(prefill);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState(getRecent());

  useEffect(() => {
    if (prefill) {
      handleTrack(prefill);
    }
  }, [prefill]);
  const handleTrack = async (id) => {
    const q = (id || query).trim().toUpperCase();

    if (!q) {
      setError("Please enter a tracking ID");
      return;
    }

    setError("");
    setLoading(true);
    setTracking(null);

    try {
      const result = await trackShipment(q);

      const trackingData = {
        trackingId: result.trackingNumber,
        courier: "Blue Dart",
        status: result.status === "IN_TRANSIT"
            ? "In Transit"
            : result.status,

        eta: "Not Available",
        origin: result.origin,
        destination: result.destination,
        customer: result.receiverName,
        currentLocation: result.destination,

        steps: [
          {
            label: "Order Placed",
            time: "Available in shipment record",
            location: result.origin,
            status: "completed"
          },
          {
            label: "Picked Up",
            time: "Available in shipment record",
            location: result.origin,
            status: "completed"
          },
          {
            label: "In Transit",
            time: "Current",
            location: result.origin,
            status: result.status === "IN_TRANSIT"
                ? "active"
                : "completed"
          },
          {
            label: "Reached Local Hub",
            time: "Upcoming",
            location: result.destination,
            status: "upcoming"
          },
          {
            label: "Out for Delivery",
            time: "Upcoming",
            location: result.destination,
            status: "upcoming"
          },
          {
            label: "Delivered",
            time: "Upcoming",
            location: result.destination,
            status: "upcoming"
          }
        ]
      };

      setTracking(trackingData);

      addRecent(q);
      setRecent(getRecent());

    } catch (error) {
      console.error("Tracking error:", error);

      setError(`No shipment found for tracking ID "${q}".`);
      showToast("Tracking ID not found", "error");

    } finally {
      setLoading(false);
    }
  };
  const completedSteps = tracking?.steps.filter((s) => s.status === "completed").length || 0;
  const totalSteps = tracking?.steps.length || 0;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const statusStyle = {
    "In Transit": { bg: "#eff6ff", color: "#2563eb" },
    "Out for Delivery": { bg: "#fff7ed", color: "#ea580c" },
    "Delivered": { bg: "#f0fdf4", color: "#10b981" },
    "Exception": { bg: "#fef2f2", color: "#dc2626" },
    "Pending": { bg: "#fafaf9", color: "#78716c" },
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Track Your Shipment</h1>
        <p className="page-subtitle">Enter your tracking ID to get real-time shipment updates</p>
      </div>

      {/* Search box */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body">
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label htmlFor="tracking-input" className="form-label" style={{ marginBottom: 8, display: "block" }}>
                Tracking Number
              </label>
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  ref={inputRef}
                  id="tracking-input"
                  className={`form-input ${error ? "error" : ""}`}
                  style={{ paddingLeft: 42, fontSize: 15, letterSpacing: 0.5, fontFamily: "monospace" }}
                  placeholder="e.g. CF100245"
                  value={query}
                  onChange={(e) => setQuery(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                  aria-describedby={error ? "track-error" : undefined}
                  aria-invalid={!!error}
                  autoComplete="off"
                />
              </div>
              {error && <p className="form-error" id="track-error" role="alert" style={{ marginTop: 6 }}>{error}</p>}
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: 28, minWidth: 160 }}
              onClick={() => handleTrack()}
              disabled={loading}
              aria-label="Track shipment"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Tracking...</> : <><Search size={15} /> Track Shipment</>}
            </button>
          </div>

          {/* Quick access */}
          {recent.length > 0 && (
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Recent:</span>
              {recent.map((id) => (
                <button
                  key={id}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 12, fontFamily: "monospace" }}
                  onClick={() => { setQuery(id); handleTrack(id); }}
                >
                  {id}
                </button>
              ))}
            </div>
          )}

          {/* Sample IDs hint */}
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Try:</span>
            {["CF100245", "CF100246", "CF100247"].map((id) => (
              <button
                key={id}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: 12, fontFamily: "monospace", color: "#2563eb" }}
                onClick={() => { setQuery(id); handleTrack(id); }}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      {loading && (
        <div className="card">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 60, gap: 16 }}>
            <Loader2 size={36} className="animate-spin" color="#2563eb" />
            <p style={{ color: "#64748b", fontSize: 14 }}>Fetching tracking information...</p>
          </div>
        </div>
      )}

      {tracking && !loading && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
          {/* Timeline */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Shipment Timeline</h2>
                <p style={{ fontSize: 12.5, color: "#64748b", marginTop: 3 }}>
                  Current location: <strong>{tracking.currentLocation}</strong>
                </p>
              </div>
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "4px 12px",
                borderRadius: 20,
                background: statusStyle[tracking.status]?.bg || "#f1f5f9",
                color: statusStyle[tracking.status]?.color || "#475569",
              }}>
                {tracking.status}
              </span>
            </div>
            <div className="card-body">
              {/* Progress bar */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>{completedSteps} of {totalSteps} steps completed</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>{progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${progress}%`,
                      background: tracking.status === "Delivered" ? "#10b981" : "linear-gradient(90deg, #2563eb, #06b6d4)",
                    }}
                  />
                </div>
              </div>

              {/* Steps */}
              <div>
                {tracking.steps.map((step, i) => (
                  <TimelineStep key={step.label} step={step} index={i} isLast={i === tracking.steps.length - 1} />
                ))}
              </div>
            </div>
          </div>

          {/* Shipment Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div className="card-header"><h2 className="card-title">Shipment Info</h2></div>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  ["Tracking ID", <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#2563eb" }}>{tracking.trackingId}</span>],
                  ["Courier", tracking.courier],
                  ["Customer", tracking.customer],
                  ["Status", <span style={{ fontWeight: 600, color: statusStyle[tracking.status]?.color }}>{tracking.status}</span>],
                  ["Est. Delivery", tracking.eta],
                  ["Origin", tracking.origin],
                  ["Destination", tracking.destination],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f8fafc", paddingBottom: 10 }}>
                    <span style={{ fontSize: 12.5, color: "#94a3b8", fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 13.5, color: "#1e293b", fontWeight: 500 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <p style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 10, fontWeight: 600, textTransform: "uppercase" }}>Actions</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button className="btn btn-primary w-full" onClick={() => navigate("/shipments")}>
                    <Package size={14} /> View All Shipments
                  </button>
                  <button className="btn btn-secondary w-full" onClick={() => navigate("/add-shipment")}>
                    + Add New Shipment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
