import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Truck, CheckCircle, AlertTriangle, Clock,
  ArrowRight, RefreshCw, Eye, MapPin,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { StatCardSkeleton, ChartSkeleton, LoadingSkeleton } from "../components/LoadingSkeleton";
import { getDashboardStats, getChartData, getShipments } from "../services/api";
import { donutData } from "../data/mockData";

const COLORS = ["#10b981", "#2563eb", "#f59e0b", "#ef4444"];
const TIME_FILTERS = [
  { label: "7 Days", value: "7" },
  { label: "30 Days", value: "30" },
  { label: "90 Days", value: "90" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        fontSize: 13,
      }}>
        <p style={{ fontWeight: 600, marginBottom: 6, color: "#1e293b" }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color, marginBottom: 2 }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentShipments, setRecentShipments] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [period, setPeriod] = useState("7");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    getDashboardStats().then((data) => { setStats(data); setLoadingStats(false); });
    getShipments({ page: 1, pageSize: 6 }).then((res) => {
      setRecentShipments(res.data.slice(0, 6));
      setLoadingShipments(false);
    });
  }, []);

  useEffect(() => {
    setLoadingChart(true);
    getChartData(period).then((data) => { setChartData(data); setLoadingChart(false); });
  }, [period]);

  const statCards = stats
    ? [
        { icon: <Package size={20} />, label: "Total Shipments", value: stats.totalShipments, change: stats.totalChange, color: "#2563eb", bgColor: "#eff6ff", isUp: true },
        { icon: <Truck size={20} />, label: "In Transit", value: stats.inTransit, change: stats.inTransitChange, color: "#06b6d4", bgColor: "#ecfeff", isUp: true },
        { icon: <MapPin size={20} />, label: "Out for Delivery", value: stats.outForDelivery, change: stats.outForDeliveryChange, color: "#ea580c", bgColor: "#fff7ed", isUp: false },
        { icon: <CheckCircle size={20} />, label: "Delivered", value: stats.delivered, change: stats.deliveredChange, color: "#10b981", bgColor: "#f0fdf4", isUp: true },
        { icon: <AlertTriangle size={20} />, label: "Exceptions", value: stats.exceptions, change: stats.exceptionsChange, color: "#ef4444", bgColor: "#fef2f2", isUp: false },
      ]
    : [];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">{greeting}, Admin 👋</h1>
          <p className="page-subtitle">Here's what's happening with your shipments today.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/add-shipment")}>
            <Package size={14} /> New Shipment
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-5" style={{ marginBottom: 24 }}>
        {loadingStats
          ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card) => <StatCard key={card.label} {...card} />)
        }
      </div>

      {/* Chart + Donut */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 24 }}>
        {/* Area Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Shipment Analytics</h2>
            <div style={{ display: "flex", gap: 6 }}>
              {TIME_FILTERS.map((f) => (
                <button
                  key={f.value}
                  className={`btn btn-sm ${period === f.value ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setPeriod(f.value)}
                  aria-pressed={period === f.value}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body" style={{ paddingTop: 12 }}>
            {loadingChart ? (
              <ChartSkeleton height={280} />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="gradDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradTransit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradExc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={period === "90" ? 6 : 0} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                  <Area type="monotone" dataKey="delivered" name="Delivered" stroke="#10b981" fill="url(#gradDelivered)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Area type="monotone" dataKey="inTransit" name="In Transit" stroke="#2563eb" fill="url(#gradTransit)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Area type="monotone" dataKey="exceptions" name="Exceptions" stroke="#ef4444" fill="url(#gradExc)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Delivery Overview</h2>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  labelLine={false}
                  label={CustomPieLabel}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value.toLocaleString(), name]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
              {donutData.map((entry) => (
                <div key={entry.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#475569" }}>{entry.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{entry.value.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Shipments</h2>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/shipments")}>
            View All <ArrowRight size={14} />
          </button>
        </div>
        <div className="table-wrapper">
          {loadingShipments ? (
            <LoadingSkeleton rows={6} />
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
                  <th>Last Updated</th>
                  <th>ETA</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentShipments.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: 600, fontSize: 13, color: "#2563eb" }}>
                        {s.trackingId}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{s.customer}</td>
                    <td style={{ color: "#64748b", fontSize: 13 }}>{s.courier}</td>
                    <td style={{ fontSize: 13 }}>{s.origin}</td>
                    <td style={{ fontSize: 13 }}>{s.destination}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td style={{ color: "#94a3b8", fontSize: 12 }}>{s.lastUpdated}</td>
                    <td style={{ fontSize: 13 }}>
                      {s.status === "Delivered"
                        ? <span style={{ color: "#10b981", fontWeight: 600 }}>Delivered</span>
                        : s.eta
                      }
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-sm btn-icon"
                          title="Track"
                          onClick={() => navigate(`/track?id=${s.trackingId}`)}
                          aria-label={`Track ${s.trackingId}`}
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
