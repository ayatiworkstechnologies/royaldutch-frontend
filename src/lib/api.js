const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
const API_PREFIX = `${API_BASE_URL}/api/v1`;

export function getAdminToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("royaldutch_admin_token") || "";
}

export function setAdminToken(token) {
  localStorage.setItem("royaldutch_admin_token", token);
}

export function clearAdminToken() {
  localStorage.removeItem("royaldutch_admin_token");
}

export function getCustomerToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("royaldutch_customer_token") || "";
}

export function setCustomerSession(data) {
  localStorage.setItem("royaldutch_customer_token", data.access_token);
  localStorage.setItem("royaldutch_customer_profile", JSON.stringify({ name: data.name, email: data.email, role: data.role }));
}

export function getCustomerProfile() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("royaldutch_customer_profile") || "null");
  } catch {
    return null;
  }
}

export function clearCustomerSession() {
  localStorage.removeItem("royaldutch_customer_token");
  localStorage.removeItem("royaldutch_customer_profile");
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
  if (options.customer) {
    const token = getCustomerToken();
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
    if (response.status === 401 && options.admin) clearAdminToken();
    const detail = data?.detail || data?.message || "Request failed";
    throw new Error(Array.isArray(detail) ? detail.map((item) => item.msg).join(", ") : detail);
  }

  return data;
}

export async function apiBlob(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.admin) {
    const token = getAdminToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (options.customer) {
    const token = getCustomerToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_PREFIX}${path}`, { ...options, headers, cache: "no-store" });
  if (!response.ok) {
    if (response.status === 401 && options.admin) clearAdminToken();
    throw new Error("Download failed");
  }
  return response.blob();
}

export const api = {
  login: (payload) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  requestCustomerOtp: (email) => apiFetch("/auth/otp/request", { method: "POST", body: JSON.stringify({ email }) }),
  verifyCustomerOtp: (email, code, extra = {}) => apiFetch("/auth/otp/verify", { method: "POST", body: JSON.stringify({ email, code, ...extra }) }),
  googleLogin: (credential) => apiFetch("/auth/google", { method: "POST", body: JSON.stringify({ credential }) }),
  categories: (includeInactive = false) => apiFetch(`/categories${includeInactive ? "?include_inactive=true" : ""}`),
  createCategory: (payload) => apiFetch("/categories", { method: "POST", admin: true, body: JSON.stringify(payload) }),
  updateCategory: (id, payload) => apiFetch(`/categories/${id}`, { method: "PATCH", admin: true, body: JSON.stringify(payload) }),
  deleteCategory: (id) => apiFetch(`/categories/${id}`, { method: "DELETE", admin: true }),
  services: (categorySlug = "", includeInactive = false) => {
    const params = new URLSearchParams();
    if (categorySlug) params.set("category_slug", categorySlug);
    if (includeInactive) params.set("include_inactive", "true");
    return apiFetch(`/services${params.toString() ? `?${params.toString()}` : ""}`);
  },
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
  myBookings: () => apiFetch("/bookings/me", { customer: true }),
  myProfile: () => apiFetch("/account/me", { customer: true }),
  updateMyProfile: (payload) => apiFetch("/account/me", { method: "PATCH", customer: true, body: JSON.stringify(payload) }),
  myInvoices: () => apiFetch("/account/invoices", { customer: true }),
  myInvoicePdf: (id) => apiBlob(`/account/invoices/${id}/pdf`, { customer: true }),
  bookings: ({ status = "", bookingDate = "" } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (bookingDate) params.set("booking_date", bookingDate);
    return apiFetch(`/bookings${params.toString() ? `?${params.toString()}` : ""}`, { admin: true });
  },
  calendarBookings: ({ startDate, endDate, staffId = "" }) => {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
    if (staffId) params.set("staff_id", staffId);
    return apiFetch(`/bookings/calendar?${params.toString()}`, { admin: true });
  },
  updateBookingStatus: (id, status) => apiFetch(`/bookings/${id}/status`, { method: "PATCH", admin: true, body: JSON.stringify({ status }) }),
  queueBookingMail: (id, template) => apiFetch(`/bookings/${id}/mail/${template}`, { method: "POST", admin: true }),
  dashboard: () => apiFetch("/dashboard", { admin: true }),
  patients: () => apiFetch("/patients", { admin: true }),
  createPatient: (payload) => apiFetch("/patients", { method: "POST", admin: true, body: JSON.stringify(payload) }),
  updatePatient: (id, payload) => apiFetch(`/patients/${id}`, { method: "PATCH", admin: true, body: JSON.stringify(payload) }),
  payments: () => apiFetch("/payments", { admin: true }),
  createPayment: (payload) => apiFetch("/payments", { method: "POST", admin: true, body: JSON.stringify(payload) }),
  updatePayment: (id, payload) => apiFetch(`/payments/${id}`, { method: "PATCH", admin: true, body: JSON.stringify(payload) }),
  invoices: () => apiFetch("/billing", { admin: true }),
  invoice: (id) => apiFetch(`/billing/${id}`, { admin: true }),
  invoicePdf: (id) => apiBlob(`/billing/${id}/pdf`, { admin: true }),
  sendInvoice: (id, attachPdf = true) => apiFetch(`/billing/${id}/send?attach_pdf=${attachPdf ? "true" : "false"}`, { method: "POST", admin: true }),
  createInvoice: (payload) => apiFetch("/billing", { method: "POST", admin: true, body: JSON.stringify(payload) }),
  createInvoiceFromBooking: (bookingId, payload = {}) => apiFetch(`/billing/from-booking/${bookingId}`, { method: "POST", admin: true, body: JSON.stringify(payload) }),
  updateInvoice: (id, payload) => apiFetch(`/billing/${id}`, { method: "PATCH", admin: true, body: JSON.stringify(payload) }),
  deleteInvoice: (id) => apiFetch(`/billing/${id}`, { method: "DELETE", admin: true }),
  mail: () => apiFetch("/mail", { admin: true }),
  createMail: (payload) => apiFetch("/mail", { method: "POST", admin: true, body: JSON.stringify(payload) }),
  updateMail: (id, payload) => apiFetch(`/mail/${id}`, { method: "PATCH", admin: true, body: JSON.stringify(payload) }),
  deleteMail: (id) => apiFetch(`/mail/${id}`, { method: "DELETE", admin: true }),
  sendMail: (id) => apiFetch(`/mail/${id}/send`, { method: "POST", admin: true }),
  sendQueuedMail: (includeFailed = false) => apiFetch(`/mail/send-queued${includeFailed ? "?include_failed=true" : ""}`, { method: "POST", admin: true }),
  smtpStatus: () => apiFetch("/mail/smtp-status", { admin: true }),
  emailTemplates: () => apiFetch("/email-templates", { admin: true }),
  seedEmailTemplates: () => apiFetch("/email-templates/seed-defaults", { method: "POST", admin: true }),
  createEmailTemplate: (payload) => apiFetch("/email-templates", { method: "POST", admin: true, body: JSON.stringify(payload) }),
  updateEmailTemplate: (id, payload) => apiFetch(`/email-templates/${id}`, { method: "PATCH", admin: true, body: JSON.stringify(payload) }),
  deleteEmailTemplate: (id) => apiFetch(`/email-templates/${id}`, { method: "DELETE", admin: true }),
  settings: () => apiFetch("/settings", { admin: true }),
  updateSettings: (payload) => apiFetch("/settings", { method: "PATCH", admin: true, body: JSON.stringify(payload) }),
  notifications: () => apiFetch("/notifications", { admin: true }),
  createNotification: (payload) => apiFetch("/notifications", { method: "POST", admin: true, body: JSON.stringify(payload) }),
  updateNotification: (id, payload) => apiFetch(`/notifications/${id}`, { method: "PATCH", admin: true, body: JSON.stringify(payload) }),
};

export function money(value, currency = "AED") {
  if (value === null || value === undefined || value === "") return "Price on Consultation";
  return `${currency} ${Number(value).toLocaleString()}`;
}

export function duration(value) {
  if (!value) return "Duration confirmed by clinic";
  return `${value} mins`;
}
