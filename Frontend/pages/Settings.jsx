import React, { useState } from "react";
import { User, Bell, Palette, Shield, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "../components/ToastProvider";

const Toggle = ({ checked, onChange, id }) => (
  <label className="toggle-switch" htmlFor={id}>
    <input type="checkbox" id={id} checked={checked} onChange={onChange} />
    <span className="toggle-slider" />
  </label>
);

const TABS = [
  { id: "profile", label: "Profile", icon: <User size={16} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { id: "appearance", label: "Appearance", icon: <Palette size={16} /> },
  { id: "security", label: "Security", icon: <Shield size={16} /> },
];

export default function Settings() {
  const { showToast } = useToast();
  const [tab, setTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profile, setProfile] = useState({
    name: "Admin",
    email: "admin@courierflow.com",
    phone: "+91 98765 43210",
    company: "CourierFlow Logistics",
    role: "Administrator",
    timezone: "Asia/Kolkata",
  });

  const [notifSettings, setNotifSettings] = useState({
    shipmentDelivered: true,
    shipmentDelayed: true,
    exceptionAlert: true,
    newShipment: false,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReport: true,
  });

  const [appearance, setAppearance] = useState({
    theme: "light",
    sidebarStyle: "expanded",
    density: "comfortable",
    accentColor: "blue",
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactor: false,
    sessionTimeout: "60",
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    showToast("Settings saved successfully", "success");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and application preferences</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "start" }}>
        {/* Sidebar tabs */}
        <div className="card" style={{ padding: 8 }}>
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 13.5,
                fontWeight: tab === id ? 600 : 400,
                color: tab === id ? "#2563eb" : "#475569",
                background: tab === id ? "#eff6ff" : "transparent",
                transition: "all 0.15s",
                textAlign: "left",
              }}
              aria-current={tab === id ? "page" : undefined}
            >
              <span style={{ color: tab === id ? "#2563eb" : "#94a3b8" }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {/* Profile */}
          {tab === "profile" && (
            <div className="settings-section">
              <div className="settings-header">
                <div className="settings-title">Profile Information</div>
                <div className="settings-desc">Update your personal details and account info</div>
              </div>
              <div className="settings-body">
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
                  <div style={{ width: 72, height: 72, borderRadius: 18, background: "linear-gradient(135deg, #2563eb, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 28, fontWeight: 700, flexShrink: 0 }}>
                    A
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 16, color: "#1e293b" }}>{profile.name}</p>
                    <p style={{ fontSize: 13, color: "#64748b" }}>{profile.role}</p>
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}>Change Avatar</button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    { label: "Full Name", key: "name", type: "text" },
                    { label: "Email Address", key: "email", type: "email" },
                    { label: "Phone Number", key: "phone", type: "tel" },
                    { label: "Company", key: "company", type: "text" },
                    { label: "Role", key: "role", type: "text", disabled: true },
                    { label: "Timezone", key: "timezone", type: "text" },
                  ].map(({ label, key, type, disabled }) => (
                    <div className="form-group" key={key}>
                      <label className="form-label" htmlFor={`profile-${key}`}>{label}</label>
                      <input
                        id={`profile-${key}`}
                        type={type}
                        className="form-input"
                        value={profile[key]}
                        disabled={disabled}
                        onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                        style={disabled ? { background: "#f8fafc", color: "#94a3b8" } : {}}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {tab === "notifications" && (
            <div className="settings-section">
              <div className="settings-header">
                <div className="settings-title">Notification Preferences</div>
                <div className="settings-desc">Choose which events trigger notifications</div>
              </div>
              <div className="settings-body">
                <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: 12 }}>Shipment Events</p>
                {[
                  { key: "shipmentDelivered", label: "Shipment Delivered", desc: "Get notified when a shipment is delivered" },
                  { key: "shipmentDelayed", label: "Shipment Delayed", desc: "Get notified when a shipment is delayed" },
                  { key: "exceptionAlert", label: "Delivery Exception", desc: "Get notified about delivery exceptions" },
                  { key: "newShipment", label: "New Shipment Created", desc: "Get notified when a new shipment is added" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="settings-row">
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 500, color: "#1e293b" }}>{label}</p>
                      <p style={{ fontSize: 12.5, color: "#94a3b8" }}>{desc}</p>
                    </div>
                    <Toggle id={key} checked={notifSettings[key]} onChange={(e) => setNotifSettings((s) => ({ ...s, [key]: e.target.checked }))} />
                  </div>
                ))}

                <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", margin: "20px 0 12px" }}>Channels</p>
                {[
                  { key: "emailNotifications", label: "Email Notifications", desc: "Receive notifications via email" },
                  { key: "smsNotifications", label: "SMS Notifications", desc: "Receive notifications via SMS" },
                  { key: "pushNotifications", label: "Push Notifications", desc: "Browser push notifications" },
                  { key: "weeklyReport", label: "Weekly Summary Report", desc: "Receive a weekly performance report" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="settings-row">
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 500, color: "#1e293b" }}>{label}</p>
                      <p style={{ fontSize: 12.5, color: "#94a3b8" }}>{desc}</p>
                    </div>
                    <Toggle id={key} checked={notifSettings[key]} onChange={(e) => setNotifSettings((s) => ({ ...s, [key]: e.target.checked }))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance */}
          {tab === "appearance" && (
            <div className="settings-section">
              <div className="settings-header">
                <div className="settings-title">Appearance</div>
                <div className="settings-desc">Customize the look and feel of the dashboard</div>
              </div>
              <div className="settings-body">
                <div className="settings-row">
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: "#1e293b" }}>Theme</p>
                    <p style={{ fontSize: 12.5, color: "#94a3b8" }}>Choose between light and dark mode</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["light", "dark"].map((t) => (
                      <button
                        key={t}
                        className={`btn btn-sm ${appearance.theme === t ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setAppearance((a) => ({ ...a, theme: t }))}
                        style={{ textTransform: "capitalize" }}
                        aria-pressed={appearance.theme === t}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-row">
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: "#1e293b" }}>Sidebar Style</p>
                    <p style={{ fontSize: 12.5, color: "#94a3b8" }}>Choose sidebar display mode</p>
                  </div>
                  <select
                    className="form-select"
                    style={{ width: "auto" }}
                    value={appearance.sidebarStyle}
                    onChange={(e) => setAppearance((a) => ({ ...a, sidebarStyle: e.target.value }))}
                    aria-label="Sidebar style"
                  >
                    <option value="expanded">Expanded</option>
                    <option value="collapsed">Collapsed</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div className="settings-row">
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: "#1e293b" }}>Density</p>
                    <p style={{ fontSize: 12.5, color: "#94a3b8" }}>Adjust the spacing in the interface</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["compact", "comfortable", "spacious"].map((d) => (
                      <button
                        key={d}
                        className={`btn btn-sm ${appearance.density === d ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setAppearance((a) => ({ ...a, density: d }))}
                        style={{ textTransform: "capitalize" }}
                        aria-pressed={appearance.density === d}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-row">
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: "#1e293b" }}>Accent Color</p>
                    <p style={{ fontSize: 12.5, color: "#94a3b8" }}>Primary accent color for the UI</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      { id: "blue", color: "#2563eb" },
                      { id: "cyan", color: "#06b6d4" },
                      { id: "emerald", color: "#10b981" },
                      { id: "violet", color: "#7c3aed" },
                    ].map(({ id, color }) => (
                      <button
                        key={id}
                        onClick={() => setAppearance((a) => ({ ...a, accentColor: id }))}
                        aria-label={`${id} accent color`}
                        aria-pressed={appearance.accentColor === id}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: color,
                          border: appearance.accentColor === id ? `3px solid ${color}` : "3px solid transparent",
                          outline: appearance.accentColor === id ? `2px solid #fff` : "none",
                          boxShadow: appearance.accentColor === id ? `0 0 0 3px ${color}40` : "none",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {tab === "security" && (
            <div className="settings-section">
              <div className="settings-header">
                <div className="settings-title">Security</div>
                <div className="settings-desc">Manage your password and security settings</div>
              </div>
              <div className="settings-body">
                <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: 12 }}>Change Password</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                  {[
                    { label: "Current Password", key: "currentPassword" },
                    { label: "New Password", key: "newPassword" },
                    { label: "Confirm New Password", key: "confirmPassword" },
                  ].map(({ label, key }) => (
                    <div className="form-group" key={key} style={{ maxWidth: 400 }}>
                      <label className="form-label" htmlFor={`sec-${key}`}>{label}</label>
                      <div style={{ position: "relative" }}>
                        <input
                          id={`sec-${key}`}
                          type={showPassword ? "text" : "password"}
                          className="form-input"
                          style={{ paddingRight: 40 }}
                          value={security[key]}
                          onChange={(e) => setSecurity((s) => ({ ...s, [key]: e.target.value }))}
                          placeholder="••••••••"
                          autoComplete={key === "currentPassword" ? "current-password" : "new-password"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="divider" style={{ marginBottom: 20 }} />
                <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: 12 }}>Security Options</p>

                <div className="settings-row">
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: "#1e293b" }}>Two-Factor Authentication</p>
                    <p style={{ fontSize: 12.5, color: "#94a3b8" }}>Add an extra layer of security to your account</p>
                  </div>
                  <Toggle id="twoFactor" checked={security.twoFactor} onChange={(e) => setSecurity((s) => ({ ...s, twoFactor: e.target.checked }))} />
                </div>

                <div className="settings-row">
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: "#1e293b" }}>Session Timeout</p>
                    <p style={{ fontSize: 12.5, color: "#94a3b8" }}>Automatically log out after inactivity</p>
                  </div>
                  <select
                    className="form-select"
                    style={{ width: "auto" }}
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity((s) => ({ ...s, sessionTimeout: e.target.value }))}
                    aria-label="Session timeout"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: 140 }}>
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
