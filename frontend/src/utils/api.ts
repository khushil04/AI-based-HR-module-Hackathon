import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("ai-hrms-auth");
  if (raw) {
    try {
      const { token } = JSON.parse(raw) as { token: string };
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore invalid storage
    }
  }

  // Let axios set multipart boundary; a bare "multipart/form-data" breaks file uploads
  if (config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }

  return config;
});
