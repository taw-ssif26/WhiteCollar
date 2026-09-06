import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("wc_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("wc_token");
      localStorage.removeItem("wc_role");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  adminLogin: (username: string, password: string) =>
    api.post("/auth/admin/login", { username, password }),
  studentLogin: (username: string, password: string) =>
    api.post("/auth/student/login", { username, password }),
};

// ─── Admin: Dashboard ─────────────────────────────────────────────────────────
export const dashboardAPI = {
  get: () => api.get("/admin/dashboard"),
};

// ─── Admin: Students ──────────────────────────────────────────────────────────
export const studentsAPI = {
  list: (params?: { search?: string; batch?: string; is_active?: boolean }) =>
    api.get("/admin/students", { params }),
  get: (id: string) => api.get(`/admin/students/${id}`),
  create: (data: any) => api.post("/admin/students", data),
  update: (id: string, data: any) => api.put(`/admin/students/${id}`, data),
  delete: (id: string) => api.delete(`/admin/students/${id}`),
  uploadPhoto: (id: string, file: File) => {
    const form = new FormData();
    form.append("photo", file);
    return api.post(`/admin/students/${id}/photo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  bulkImport: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/admin/students/bulk-import", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ─── Admin: Results ───────────────────────────────────────────────────────────
export const resultsAPI = {
  list: (student_id?: string) => api.get("/admin/results", { params: { student_id } }),
  create: (data: any) => api.post("/admin/results", data),
  update: (id: string, data: any) => api.put(`/admin/results/${id}`, data),
  delete: (id: string) => api.delete(`/admin/results/${id}`),
  resendWhatsApp: (id: string) => api.post(`/admin/results/${id}/send-whatsapp`),
};

// ─── Admin: Invoices ──────────────────────────────────────────────────────────
export const invoicesAPI = {
  list: (params?: { student_id?: string; is_paid?: boolean }) =>
    api.get("/admin/invoices", { params }),
  create: (data: any) => api.post("/admin/invoices", data),
  update: (id: string, data: any) => api.put(`/admin/invoices/${id}`, data),
  delete: (id: string) => api.delete(`/admin/invoices/${id}`),
  markPaid: (id: string) => api.post(`/admin/invoices/${id}/mark-paid`),
  resendWhatsApp: (id: string) => api.post(`/admin/invoices/${id}/send-whatsapp`),
};

// ─── Admin: Events ────────────────────────────────────────────────────────────
export const eventsAdminAPI = {
  list: () => api.get("/admin/events"),
  create: (data: any) => api.post("/admin/events", data),
  update: (id: string, data: any) => api.put(`/admin/events/${id}`, data),
  delete: (id: string) => api.delete(`/admin/events/${id}`),
  uploadImage: (id: string, file: File) => {
    const form = new FormData();
    form.append("image", file);
    return api.post(`/admin/events/${id}/image`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ─── Admin: Gallery ───────────────────────────────────────────────────────────
export const galleryAdminAPI = {
  list: () => api.get("/admin/gallery"),
  create: (title: string, category: string, file: File) => {
    const form = new FormData();
    form.append("title", title);
    form.append("category", category);
    form.append("image", file);
    return api.post("/admin/gallery", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (id: string) => api.delete(`/admin/gallery/${id}`),
};

// ─── Student Portal ───────────────────────────────────────────────────────────
export const studentPortalAPI = {
  profile: () => api.get("/student/profile"),
  results: () => api.get("/student/results"),
  invoices: () => api.get("/student/invoices"),
  changePassword: (current_password: string, new_password: string) =>
    api.post("/student/change-password", { current_password, new_password }),
};

// ─── Public ───────────────────────────────────────────────────────────────────
export const publicAPI = {
  events: () => api.get("/public/events"),
  gallery: (category?: string) => api.get("/public/gallery", { params: { category } }),
  galleryCategories: () => api.get("/public/gallery/categories"),
};
