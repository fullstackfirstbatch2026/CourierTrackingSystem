import axios from "axios";
import {
  mockShipments,
  mockDashboardStats,
  mockCouriers,
  mockTrackingData,
  mockExceptions,
  mockNotifications,
  chartData7,
  chartData30,
  chartData90,
} from "../data/mockData";

// =============================================
// API CONFIGURATION
// Replace BASE_URL with your Spring Boot backend
// =============================================
const API_BASE_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = true; // Set to false when backend is ready

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Request interceptor (e.g., add auth token)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

// Helper to simulate API delay for realistic UX
const delay = (ms = 800) => new Promise((res) => setTimeout(res, ms));

// =============================================
// DASHBOARD
// =============================================
export const getDashboardStats = async () => {
  if (USE_MOCK_DATA) {
    await delay(600);
    return mockDashboardStats;
  }
  return apiClient.get("/dashboard/stats");
};

export const getChartData = async (period = "7") => {
  if (USE_MOCK_DATA) {
    await delay(700);
    if (period === "30") return chartData30;
    if (period === "90") return chartData90;
    return chartData7;
  }
  return apiClient.get(`/dashboard/chart?period=${period}`);
};

// =============================================
// SHIPMENTS
// =============================================
export const getShipments = async (params = {}) => {
  if (USE_MOCK_DATA) {
    await delay(800);
    let data = [...mockShipments];

    // Filter by status
    if (params.status && params.status !== "All") {
      data = data.filter((s) => s.status === params.status);
    }

    // Filter by courier
    if (params.courier && params.courier !== "All") {
      data = data.filter((s) => s.courier === params.courier);
    }

    // Search
    if (params.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (s) =>
          s.trackingId.toLowerCase().includes(q) ||
          s.customer.toLowerCase().includes(q) ||
          s.origin.toLowerCase().includes(q) ||
          s.destination.toLowerCase().includes(q)
      );
    }

    // Sort
    if (params.sort === "date_desc") {
      data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    } else if (params.sort === "date_asc") {
      data.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
    }

    return {
      data,
      total: data.length,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    };
  }
  return apiClient.get("/shipments", { params });
};

export const getShipmentById = async (id) => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const shipment = mockShipments.find((s) => s.id === id || s.trackingId === id);
    if (!shipment) throw new Error("Shipment not found");
    return shipment;
  }
  return apiClient.get(`/shipments/${id}`);
};

export const createShipment = async (data) => {
  if (USE_MOCK_DATA) {
    await delay(1200);
    const newShipment = {
      id: mockShipments.length + 1,
      trackingId: `CF1003${Math.floor(Math.random() * 90) + 10}`,
      customer: data.receiverName,
      customerPhone: data.receiverPhone,
      courier: data.courierService,
      origin: data.senderAddress?.split(",").pop()?.trim() || "Unknown",
      destination: data.receiverAddress?.split(",").pop()?.trim() || "Unknown",
      status: "Pending",
      createdDate: new Date().toISOString().split("T")[0],
      lastUpdated: "Just now",
      eta: data.expectedDeliveryDate || "TBD",
      weight: data.packageWeight ? `${data.packageWeight} kg` : "N/A",
      packageType: data.packageType || "Standard",
      paymentType: data.paymentType || "Prepaid",
      senderName: data.senderName,
      senderPhone: data.senderPhone,
      senderAddress: data.senderAddress,
      receiverAddress: data.receiverAddress,
      specialInstructions: data.specialInstructions || "",
    };
    mockShipments.unshift(newShipment);
    return newShipment;
  }
  return apiClient.post("/shipments", data);
};

export const updateShipment = async (id, data) => {
  if (USE_MOCK_DATA) {
    await delay(800);
    const idx = mockShipments.findIndex((s) => s.id === id);
    if (idx !== -1) {
      mockShipments[idx] = { ...mockShipments[idx], ...data, lastUpdated: "Just now" };
      return mockShipments[idx];
    }
    throw new Error("Shipment not found");
  }
  return apiClient.put(`/shipments/${id}`, data);
};

export const deleteShipment = async (id) => {
  if (USE_MOCK_DATA) {
    await delay(600);
    const idx = mockShipments.findIndex((s) => s.id === id);
    if (idx !== -1) mockShipments.splice(idx, 1);
    return { success: true };
  }
  return apiClient.delete(`/shipments/${id}`);
};

// =============================================
// TRACKING
// =============================================
export const trackShipment = async (trackingNumber) => {
  if (USE_MOCK_DATA) {
    await delay(1000);
    const track = mockTrackingData[trackingNumber.toUpperCase()];
    if (!track) {
      // Return a generic result for any CF* number
      if (trackingNumber.toUpperCase().startsWith("CF")) {
        return {
          trackingId: trackingNumber.toUpperCase(),
          courier: "Blue Dart",
          status: "In Transit",
          eta: "Oct 6, 2026",
          origin: "Mumbai",
          destination: "Delhi",
          customer: "Demo Customer",
          currentLocation: "Nagpur Junction Hub",
          steps: [
            { label: "Order Placed", time: "Oct 1, 2026 – 10:00 AM", location: "Mumbai", status: "completed" },
            { label: "Picked Up", time: "Oct 1, 2026 – 3:00 PM", location: "Mumbai Hub", status: "completed" },
            { label: "In Transit", time: "Oct 2, 2026 – 7:00 AM", location: "Nagpur Junction", status: "active" },
            { label: "Reached Local Hub", time: "Expected Oct 5", location: "Delhi Sorting", status: "upcoming" },
            { label: "Out for Delivery", time: "Expected Oct 6", location: "Delhi", status: "upcoming" },
            { label: "Delivered", time: "Expected Oct 6", location: "New Delhi", status: "upcoming" },
          ],
        };
      }
      throw new Error("Tracking ID not found");
    }
    return track;
  }
  return apiClient.get(`/tracking/${trackingNumber}`);
};

// =============================================
// COURIERS
// =============================================
export const getCouriers = async () => {
  if (USE_MOCK_DATA) {
    await delay(600);
    return mockCouriers;
  }
  return apiClient.get("/couriers");
};

// =============================================
// EXCEPTIONS
// =============================================
export const getExceptions = async () => {
  if (USE_MOCK_DATA) {
    await delay(700);
    return mockExceptions;
  }
  return apiClient.get("/exceptions");
};

// =============================================
// NOTIFICATIONS
// =============================================
export const getNotifications = async () => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return mockNotifications;
  }
  return apiClient.get("/notifications");
};

export const markNotificationRead = async (id) => {
  if (USE_MOCK_DATA) {
    await delay(200);
    const n = mockNotifications.find((n) => n.id === id);
    if (n) n.read = true;
    return { success: true };
  }
  return apiClient.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async () => {
  if (USE_MOCK_DATA) {
    await delay(300);
    mockNotifications.forEach((n) => (n.read = true));
    return { success: true };
  }
  return apiClient.post("/notifications/mark-all-read");
};
