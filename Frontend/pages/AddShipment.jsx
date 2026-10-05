import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Phone, MapPin, Package, Weight, Calendar,
  CreditCard, FileText, ChevronRight, Loader2, CheckCircle,
} from "lucide-react";
import { useToast } from "../components/ToastProvider";
import { createShipment } from "../services/api";
import { courierOptions, packageTypes, paymentTypes } from "../data/mockData";

const FIELDS = {
  senderName: { label: "Sender Name", placeholder: "Full name", icon: <User size={15} />, required: true },
  senderPhone: { label: "Sender Phone", placeholder: "+91 XXXXX XXXXX", icon: <Phone size={15} />, required: true, type: "tel" },
  senderAddress: { label: "Sender Address", placeholder: "Complete address with city & pincode", icon: <MapPin size={15} />, required: true, multiline: true },
  receiverName: { label: "Receiver Name", placeholder: "Full name", icon: <User size={15} />, required: true },
  receiverPhone: { label: "Receiver Phone", placeholder: "+91 XXXXX XXXXX", icon: <Phone size={15} />, required: true, type: "tel" },
  receiverAddress: { label: "Receiver Address", placeholder: "Complete address with city & pincode", icon: <MapPin size={15} />, required: true, multiline: true },
};

const validate = (form) => {
  const errors = {};
  if (!form.senderName?.trim()) errors.senderName = "Sender name is required";
  if (!form.senderPhone?.trim()) errors.senderPhone = "Sender phone is required";
  else if (!/^[\+\d\s]{10,15}$/.test(form.senderPhone.trim())) errors.senderPhone = "Invalid phone number";
  if (!form.senderAddress?.trim()) errors.senderAddress = "Sender address is required";
  if (!form.receiverName?.trim()) errors.receiverName = "Receiver name is required";
  if (!form.receiverPhone?.trim()) errors.receiverPhone = "Receiver phone is required";
  else if (!/^[\+\d\s]{10,15}$/.test(form.receiverPhone.trim())) errors.receiverPhone = "Invalid phone number";
  if (!form.receiverAddress?.trim()) errors.receiverAddress = "Receiver address is required";
  if (!form.courierService) errors.courierService = "Please select a courier";
  if (!form.packageType) errors.packageType = "Please select a package type";
  if (!form.packageWeight?.trim()) errors.packageWeight = "Package weight is required";
  else if (isNaN(form.packageWeight) || parseFloat(form.packageWeight) <= 0) errors.packageWeight = "Enter a valid weight";
  return errors;
};

const defaultForm = {
  senderName: "", senderPhone: "", senderAddress: "",
  receiverName: "", receiverPhone: "", receiverAddress: "",
  courierService: "", packageType: "", packageWeight: "",
  expectedDeliveryDate: "", paymentType: "Prepaid", specialInstructions: "",
};

export default function AddShipment() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({ ...defaultForm });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showToast("Please fix the errors before submitting", "error");
      return;
    }
    setLoading(true);
    try {
      const result = await createShipment(form);
      setSuccess(result);
      showToast(`Shipment ${result.trackingId} created successfully!`, "success");
    } catch {
      showToast("Failed to create shipment. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ ...defaultForm });
    setErrors({});
    setSuccess(null);
  };

  if (success) {
    return (
      <div className="page-container">
        <div style={{ maxWidth: 500, margin: "60px auto", textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckCircle size={40} color="#10b981" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Shipment Created!</h2>
          <p style={{ color: "#64748b", marginBottom: 24 }}>Your shipment has been successfully created and assigned.</p>
          <div className="card" style={{ padding: 20, marginBottom: 24, textAlign: "left" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
              {[
                ["Tracking ID", <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#2563eb" }}>{success.trackingId}</span>],
                ["Status", <span className="badge badge-pending">Pending</span>],
                ["Courier", success.courier],
                ["Customer", success.customer],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn btn-secondary" onClick={handleReset}>Add Another</button>
            <button className="btn btn-primary" onClick={() => navigate("/shipments")}>
              View Shipments <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Add New Shipment</h1>
        <p className="page-subtitle">Fill in the details to create a new shipment</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
          {/* Sender Info */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <User size={17} color="#2563eb" /> Sender Information
              </h2>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {["senderName", "senderPhone", "senderAddress"].map((key) => {
                const f = FIELDS[key];
                return (
                  <div className="form-group" key={key}>
                    <label className="form-label" htmlFor={key}>
                      {f.label} {f.required && <span className="required">*</span>}
                    </label>
                    {f.multiline ? (
                      <textarea
                        id={key}
                        className={`form-textarea ${errors[key] ? "error" : ""}`}
                        placeholder={f.placeholder}
                        value={form[key]}
                        onChange={(e) => set(key, e.target.value)}
                        rows={3}
                        aria-invalid={!!errors[key]}
                        aria-describedby={errors[key] ? `${key}-error` : undefined}
                      />
                    ) : (
                      <input
                        id={key}
                        type={f.type || "text"}
                        className={`form-input ${errors[key] ? "error" : ""}`}
                        placeholder={f.placeholder}
                        value={form[key]}
                        onChange={(e) => set(key, e.target.value)}
                        aria-invalid={!!errors[key]}
                        aria-describedby={errors[key] ? `${key}-error` : undefined}
                      />
                    )}
                    {errors[key] && <p className="form-error" id={`${key}-error`} role="alert">{errors[key]}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Receiver Info */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <User size={17} color="#10b981" /> Receiver Information
              </h2>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {["receiverName", "receiverPhone", "receiverAddress"].map((key) => {
                const f = FIELDS[key];
                return (
                  <div className="form-group" key={key}>
                    <label className="form-label" htmlFor={key}>
                      {f.label} {f.required && <span className="required">*</span>}
                    </label>
                    {f.multiline ? (
                      <textarea
                        id={key}
                        className={`form-textarea ${errors[key] ? "error" : ""}`}
                        placeholder={f.placeholder}
                        value={form[key]}
                        onChange={(e) => set(key, e.target.value)}
                        rows={3}
                        aria-invalid={!!errors[key]}
                        aria-describedby={errors[key] ? `${key}-error` : undefined}
                      />
                    ) : (
                      <input
                        id={key}
                        type={f.type || "text"}
                        className={`form-input ${errors[key] ? "error" : ""}`}
                        placeholder={f.placeholder}
                        value={form[key]}
                        onChange={(e) => set(key, e.target.value)}
                        aria-invalid={!!errors[key]}
                        aria-describedby={errors[key] ? `${key}-error` : undefined}
                      />
                    )}
                    {errors[key] && <p className="form-error" id={`${key}-error`} role="alert">{errors[key]}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Package Info */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Package size={17} color="#ea580c" /> Package Details
              </h2>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="courierService">Courier Service <span className="required">*</span></label>
                <select id="courierService" className={`form-select ${errors.courierService ? "error" : ""}`} value={form.courierService} onChange={(e) => set("courierService", e.target.value)} aria-invalid={!!errors.courierService}>
                  <option value="">Select courier...</option>
                  {courierOptions.map((c) => <option key={c}>{c}</option>)}
                </select>
                {errors.courierService && <p className="form-error" role="alert">{errors.courierService}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="packageType">Package Type <span className="required">*</span></label>
                <select id="packageType" className={`form-select ${errors.packageType ? "error" : ""}`} value={form.packageType} onChange={(e) => set("packageType", e.target.value)} aria-invalid={!!errors.packageType}>
                  <option value="">Select type...</option>
                  {packageTypes.map((p) => <option key={p}>{p}</option>)}
                </select>
                {errors.packageType && <p className="form-error" role="alert">{errors.packageType}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="packageWeight">Package Weight (kg) <span className="required">*</span></label>
                <input id="packageWeight" type="number" step="0.1" min="0.1" className={`form-input ${errors.packageWeight ? "error" : ""}`} placeholder="e.g. 2.5" value={form.packageWeight} onChange={(e) => set("packageWeight", e.target.value)} aria-invalid={!!errors.packageWeight} />
                {errors.packageWeight && <p className="form-error" role="alert">{errors.packageWeight}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="paymentType">Payment Type</label>
                <select id="paymentType" className="form-select" value={form.paymentType} onChange={(e) => set("paymentType", e.target.value)}>
                  {paymentTypes.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={17} color="#7c3aed" /> Additional Details
              </h2>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="expectedDeliveryDate">Expected Delivery Date</label>
                <input id="expectedDeliveryDate" type="date" className="form-input" value={form.expectedDeliveryDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => set("expectedDeliveryDate", e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="specialInstructions">Special Instructions</label>
                <textarea
                  id="specialInstructions"
                  className="form-textarea"
                  placeholder="Fragile, handle with care, don't tilt..."
                  value={form.specialInstructions}
                  onChange={(e) => set("specialInstructions", e.target.value)}
                  rows={4}
                />
              </div>

              {/* Summary Preview */}
              {(form.senderName || form.receiverName) && (
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: 14, border: "1px solid #e2e8f0" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>Preview</p>
                  {form.senderName && <p style={{ fontSize: 13 }}>From: <strong>{form.senderName}</strong></p>}
                  {form.receiverName && <p style={{ fontSize: 13 }}>To: <strong>{form.receiverName}</strong></p>}
                  {form.courierService && <p style={{ fontSize: 13 }}>Via: <strong>{form.courierService}</strong></p>}
                  {form.packageWeight && <p style={{ fontSize: 13 }}>Weight: <strong>{form.packageWeight} kg</strong></p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
          <button type="button" className="btn btn-secondary" onClick={handleReset} disabled={loading}>Reset Form</button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 160 }}>
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Creating...</>
            ) : (
              <>Create Shipment <ChevronRight size={15} /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
