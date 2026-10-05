import React, { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Search,
  Truck,
  BarChart2,
  AlertTriangle,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { group: "Main", items: [
    { to: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { to: "/shipments", label: "Shipments", icon: <Package size={18} /> },
    { to: "/add-shipment", label: "Add Shipment", icon: <PlusCircle size={18} /> },
    { to: "/track", label: "Track Shipment", icon: <Search size={18} /> },
  ]},
  { group: "Network", items: [
    { to: "/couriers", label: "Couriers", icon: <Truck size={18} /> },
    { to: "/analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
  ]},
  { group: "Alerts", items: [
    { to: "/exceptions", label: "Exceptions", icon: <AlertTriangle size={18} />, badge: 5 },
    { to: "/notifications", label: "Notifications", icon: <Bell size={18} />, badge: 4 },
  ]},
  { group: "System", items: [
    { to: "/settings", label: "Settings", icon: <Settings size={18} /> },
  ]},
];

export const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={onMobileClose} />
      )}

      <nav
        className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" aria-hidden="true">
            <Zap size={20} color="#fff" />
          </div>
          <div style={{ overflow: "hidden" }}>
            <div className="sidebar-logo-text">CourierFlow</div>
            <div className="sidebar-logo-sub">Logistics Platform</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          {NAV_ITEMS.map((group) => (
            <div key={group.group}>
              <div className="nav-section-label">{group.group}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                  onClick={() => { if (mobileOpen) onMobileClose(); }}
                  title={collapsed ? item.label : ""}
                  aria-label={item.label}
                >
                  <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Collapse button */}
        <div className="sidebar-footer">
          <button
            className="sidebar-collapse-btn"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            <span className="nav-label">Collapse</span>
          </button>
        </div>
      </nav>
    </>
  );
};
