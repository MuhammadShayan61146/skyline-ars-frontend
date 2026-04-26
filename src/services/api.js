// src/services/api.js  —  Axios API client for SKYLINE ARS
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "https://skyline-ars-backend.up.railway.app";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Token injection
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("skyline_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || err.message || "Network error";
    return Promise.reject(new Error(msg));
  }
);

export const authAPI = {
  login:           (creds) => api.post("/api/auth/login", creds).then(res => {
    if (res.token) localStorage.setItem("skyline_token", res.token);
    return res;
  }),
  register:        (data)  => api.post("/api/auth/register", data),
  getPassengers:   ()      => api.get("/api/auth/users"),
  deletePassenger: (id)    => api.delete(`/api/auth/users/${id}`),
  getMe:           ()      => api.get("/api/auth/me"),
};

export const flightsAPI = {
  getAll:       ()      => api.get("/api/flights"),
  getOne:       (id)    => api.get(`/api/flights/${id}`),
  add:          (data)  => api.post("/api/flights", data),
  delete:       (id)    => api.delete(`/api/flights/${id}`),
  updateStatus: (id, s) => api.patch(`/api/flights/${id}/status`, { status: s }),
};

export const bookingsAPI = {
  getAll:        (params) => api.get("/api/bookings", { params }),
  getMyBookings: ()       => api.get("/api/bookings/my"),
  getOne:        (ref)    => api.get(`/api/bookings/${ref}`),
  create:        (data)   => api.post("/api/bookings", data),
  cancel:        (id)     => api.patch(`/api/bookings/${id}/cancel`),
  cancelByRef:   (ref, r) => api.patch(`/api/bookings/ref/${ref}/cancel`, { reason: r }),
  delete:        (id)     => api.delete(`/api/bookings/${id}`),
};

export const maintAPI = {
  getIssues:    ()     => api.get("/api/maintenance/issues"),
  addIssue:     (data) => api.post("/api/maintenance/issues", data),
  resolveIssue: (id)   => api.patch(`/api/maintenance/issues/${id}/resolve`),
  getState:     ()     => api.get("/api/maintenance/state"),
  runPhase:     (n)    => api.post(`/api/maintenance/phase/${n}`),
  reset:        ()     => api.post("/api/maintenance/reset"),
  backup:       ()     => api.post("/api/maintenance/backup"),
  restore:      ()     => api.post("/api/maintenance/restore"),
  corruptData:  ()     => api.post("/api/maintenance/corrupt"),
  getLogs:      ()     => api.get("/api/maintenance/logs"),
  clearLogs:    ()     => api.delete("/api/maintenance/logs"),
  cocomo:       (data) => api.post("/api/maintenance/cocomo", data),
};

export default api;
