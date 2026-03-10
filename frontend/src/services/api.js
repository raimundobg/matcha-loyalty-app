import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("matcha_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("matcha_token");
      localStorage.removeItem("matcha_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

export const purchaseAPI = {
  create: (formData) =>
    api.post("/purchases", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getAll: () => api.get("/purchases"),
};

export const ticketAPI = {
  getAll: () => api.get("/tickets"),
  redeem: () => api.post("/tickets/redeem"),
};

export const ambassadorAPI = {
  register: (data) => api.post("/ambassadors/register", data),
  dashboard: () => api.get("/ambassadors/dashboard"),
  generateCode: () => api.post("/ambassadors/codes"),
  toggleCode: (codeId) => api.patch(`/ambassadors/codes/${codeId}/toggle`),
  validateCode: (code) => api.get(`/ambassadors/codes/validate/${code}`),
};

export const applicationAPI = {
  submit: (data) => api.post("/admin/applications", data),
};

export default api;
