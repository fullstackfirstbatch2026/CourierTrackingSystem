import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from "recharts";
import { TrendingUp, Package, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { getChartData, getCouriers } from "../services/api";
import { donutData, chartData30 } from "../data/mockData";
import { ChartSkeleton, StatCardSkeleton } from "../components/LoadingSkeleton";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 13 }}>
        <p style={{ fontWeight: 600, marginBottom: 6, color: "#1e293b" }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color, marginBottom: 2 }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

const deliveryTimeData = [
  { courier: "Blue Dart", avgDays: 2.1 },
  { courier: "Delhivery", avgDays: 1.8 },
  { courier: "DTDC", avgDays: 2.5 },
  { courier: "India Post", avgDays: 4.2 },
  { courier: "FedEx", avgDays: 1.4 },
  { courier: "DHL", avgDays: 1.6 },
  { courier: "Ekart", avgDays: 1.9 },
];

const COURIER_COLORS = ["#1e40af", "#dc2626", "#ea580c", "#15803d", "#7c3aed", "#ca8a04", "#0891b2"];

export default function Analytics() {
  const [couriers, setCouriers] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    Promise.all([getCouriers(), getChartData(period)]).then(([c, ch]) => {
      setCouriers(c);
      setChartData(ch);
      setLoading(false);
    });
  }, [period]);

  const courierBarData = couriers.map((c) => ({
    name: c.name.split(" ")[0],
    Delivered: c.delivered,
    "In Transit": c.inTransit,
    Exceptions: c.exceptions,
  }));

  const overallStats = [
    { label: "Total Shipments", value: "1,418", change: "+12.4%", icon: <Package size={18} />, color: "#2563eb", bg: "#eff6ff" },
    { label: "Success Rate", value: "86.5%", change: "+1.2%", icon: <TrendingUp size={18} />, color: "#10b981", bg: "#f0fdf4" },
    { label: "Avg Delivery Time", value: "2.1 days", change: "-0.3d", icon: <Clock size={18} />, color: "#f59e0b", bg: "#fffbeb" },
    { label: "Failed Deliveries", value: "18", change: "-8.3%", icon: <AlertTriangle size={18} />, color: "#ef4444", bg: "#fef2f2" },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Delivery Analytics</h1>
        <p className="page-subtitle">Track performance metrics and shipment trends</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : overallStats.map(({ label, value, change, icon, color, bg }) => (
              <div className="card" key={label} style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{value}</div>
                    <div style={{ fontSize: 13, color: "#94a3b8" }}>{label}</div>
                  </div>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color }}>
                    {icon}
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: change.startsWith("-") && label !== "Avg Delivery Time" ? "#ef4444" : "#10b981" }}>
                  {change} vs last month
                </div>
              </div>
            ))
        }
      </div>

      {/* Volume Chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h2 className="card-title">Monthly Shipment Volume</h2>
          <div style={{ display: "flex", gap: 6 }}>
            {[["7", "7 Days"], ["30", "30 Days"], ["90", "90 Days"]].map(([v, l]) => (
              <button key={v} className={`btn btn-sm ${period === v ? "btn-primary" : "btn-secondary"}`} onClick={() => setPeriod(v)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="card-body" style={{ paddingTop: 8 }}>
          {loading ? <ChartSkeleton height={260} /> : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="aGradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={period === "90" ? 8 : period === "30" ? 3 : 0} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="total" name="Total" stroke="#2563eb" fill="url(#aGradTotal)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="delivered" name="Delivered" stroke="#10b981" fill="none" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Courier Performance */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Courier Performance</h2>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            {loading ? <ChartSkeleton height={240} /> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={courierBarData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Delivered" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="In Transit" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Exceptions" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Delivery Status Distribution</h2>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value.toLocaleString(), name]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Delivery Time Comparison */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Average Delivery Time by Courier</h2>
        </div>
        <div className="card-body" style={{ paddingTop: 8 }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deliveryTimeData} layout="vertical" margin={{ top: 4, right: 20, bottom: 0, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} unit=" d" />
              <YAxis type="category" dataKey="courier" tick={{ fontSize: 12, fill: "#475569" }} tickLine={false} axisLine={false} width={80} />
              <Tooltip formatter={(v) => [`${v} days`, "Avg Delivery Time"]} />
              <Bar dataKey="avgDays" name="Avg Days" radius={[0, 4, 4, 0]}>
                {deliveryTimeData.map((entry, index) => (
                  <Cell key={index} fill={COURIER_COLORS[index % COURIER_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
