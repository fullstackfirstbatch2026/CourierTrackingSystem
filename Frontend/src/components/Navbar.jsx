import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Menu,
} from "lucide-react";

export const Navbar = ({ sidebarCollapsed, onMobileMenuClick, notifCount = 4 }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/shipments?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  return (
    <header
      className={`navbar ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
      role="banner"
    >
      {/* Mobile hamburger */}
      <button
        className="mobile-hamburger"
        onClick={onMobileMenuClick}
        aria-label="Open mobile menu"
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <div className="navbar-search" role="search">
        <Search size={15} className="navbar-search-icon" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search shipments, tracking IDs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          aria-label="Search shipments"
          id="global-search"
        />
      </div>

      <div className="navbar-actions">
        {/* Notifications */}
        <button
          className="navbar-icon-btn"
          onClick={() => navigate("/notifications")}
          aria-label={`Notifications – ${notifCount} unread`}
          title="Notifications"
        >
          <Bell size={17} />
          {notifCount > 0 && (
            <span className="notif-badge" aria-hidden="true">{notifCount}</span>
          )}
        </button>

        {/* Help */}
        <button
          className="navbar-icon-btn"
          aria-label="Help"
          title="Help & Support"
        >
          <HelpCircle size={17} />
        </button>

        {/* User profile dropdown */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <div
            className="user-profile"
            onClick={() => setDropdownOpen((v) => !v)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setDropdownOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            aria-label="User menu"
          >
            <div className="user-avatar" aria-hidden="true">A</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span className="user-name">Admin</span>
              <span className="user-role">Administrator</span>
            </div>
            <ChevronDown
              size={14}
              style={{
                color: "#94a3b8",
                transition: "transform 0.2s",
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)",
              }}
            />
          </div>

          {dropdownOpen && (
            <div className="dropdown-menu" role="menu">
              <div
                className="dropdown-item"
                role="menuitem"
                tabIndex={0}
                onClick={() => { navigate("/settings"); setDropdownOpen(false); }}
              >
                <User size={15} /> My Profile
              </div>
              <div
                className="dropdown-item"
                role="menuitem"
                tabIndex={0}
                onClick={() => { navigate("/settings"); setDropdownOpen(false); }}
              >
                <Settings size={15} /> Settings
              </div>
              <div className="dropdown-divider" />
              <div
                className="dropdown-item danger"
                role="menuitem"
                tabIndex={0}
                onClick={() => setDropdownOpen(false)}
              >
                <LogOut size={15} /> Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
