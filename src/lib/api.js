const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
const API_PREFIX = `${API_BASE_URL}/api/v1`;

export function getAdminToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("clinicflow_admin_token") || "";
}

export function setAdminToken(token) {
  localStorage.setItem("clinicflow_admin_token", token);
}

export function clearAdminToken() {
  localStorage.removeItem("clinicflow_admin_token");
}

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (options.admin) {
    const token = getAdminToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_PREFIX}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const detail = data?.detail || data?.message || "Request failed";
    throw new Error(Array.isArray(detail) ? detail.map((item) => item.msg).join(", ") : detail);
  }

  return data;
}

export const api = {
  login: (payload) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  categories: () => apiFetch("/categories"),
  createCategory: (payload) => apiFetch("/categories", { method: "POST", admin: true, body: JSON.stringify(payload) }),
  updateCategory: (id, payload) => apiFetch(`/categories/${id}`, { method: "PATCH", admin: true, body: JSON.stringify(payload) }),
  deleteCategory: (id) => apiFetch(`/categories/${id}`, { method: "DELETE", admin: true }),
  services: (categorySlug = "") => apiFetch(`/services${categorySlug ? `?category_slug=${categorySlug}` : ""}`),
  service: (slug) => apiFetch(`/services/${slug}`),
  createService: (payload) => apiFetch("/services", { method: "POST", admin: true, body: JSON.stringify(payload) }),
  updateService: (id, payload) => apiFetch(`/services/${id}`, { method: "PATCH", admin: true, body: JSON.stringify(payload) }),
  deleteService: (id) => apiFetch(`/services/${id}`, { method: "DELETE", admin: true }),
  staff: () => apiFetch("/staff"),
  createStaff: (payload) => apiFetch("/staff", { method: "POST", admin: true, body: JSON.stringify(payload) }),
  updateStaff: (id, payload) => apiFetch(`/staff/${id}`, { method: "PATCH", admin: true, body: JSON.stringify(payload) }),
  deleteStaff: (id) => apiFetch(`/staff/${id}`, { method: "DELETE", admin: true }),
  slots: ({ serviceId, selectedDate, staffId }) => {
    const params = new URLSearchParams({ service_id: serviceId, selected_date: selectedDate });
    if (staffId) params.set("staff_id", staffId);
    return apiFetch(`/bookings/slots?${params.toString()}`);
  },
  createBooking: (payload) => apiFetch("/bookings", { method: "POST", body: JSON.stringify(payload) }),
  lookupBookings: (phone) => apiFetch(`/bookings/lookup?phone=${encodeURIComponent(phone)}`),
  bookings: () => apiFetch("/bookings", { admin: true }),
  updateBookingStatus: (id, status) => apiFetch(`/bookings/${id}/status`, { method: "PATCH", admin: true, body: JSON.stringify({ status }) }),
  dashboard: () => apiFetch("/dashboard", { admin: true }),
  patients: () => apiFetch("/patients", { admin: true }),
  payments: () => apiFetch("/payments", { admin: true }),
};

export function money(value, currency = "AED") {
  if (value === null || value === undefined || value === "") return "Price on Consultation";
  return `${currency} ${Number(value).toLocaleString()}`;
}

export function duration(value) {
  if (!value) return "Duration confirmed by clinic";
  return `${value} mins`;
}
