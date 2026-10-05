import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { ToastProvider } from "./components/ToastProvider";

import Dashboard from "./pages/Dashboard";
import Shipments from "./pages/Shipments";
import AddShipment from "./pages/AddShipment";
import TrackShipment from "./pages/TrackShipment";
import Couriers from "./pages/Couriers";
import Analytics from "./pages/Analytics";
import Exceptions from "./pages/Exceptions";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";

// Scrolls to top on page navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Close action menus on outside click
function AppContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div className="app-layout">
      <ScrollToTop />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className={`main-content ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <Navbar
          sidebarCollapsed={sidebarCollapsed}
          onMobileMenuClick={() => setMobileOpen((v) => !v)}
          notifCount={4}
        />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/add-shipment" element={<AddShipment />} />
          <Route path="/track" element={<TrackShipment />} />
          <Route path="/couriers" element={<Couriers />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/exceptions" element={<Exceptions />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={
            <div className="page-container">
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 72, fontWeight: 700, color: "#e2e8f0" }}>404</div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Page Not Found</h2>
                <p style={{ color: "#64748b", marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
                <a href="/" className="btn btn-primary" style={{ textDecoration: "none" }}>Go to Dashboard</a>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
}
