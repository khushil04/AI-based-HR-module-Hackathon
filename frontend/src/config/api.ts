const isDev = import.meta.env.DEV;

export const BACKEND_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (isDev
    ? "http://localhost:5000"
    : "https://ai-based-hr-module-hackathon.onrender.com");

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `${BACKEND_URL}/api`;

export default BACKEND_URL;
