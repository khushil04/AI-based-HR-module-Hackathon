import axios from "axios";
import type { AuthResponse } from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

const authClient = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: { "Content-Type": "application/json" },
});

export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await authClient.post<AuthResponse>("/login", { email, password });
  return response.data;
};

export const registerApi = async (
  name: string,
  email: string,
  password: string,
  role: AuthResponse["user"]["role"] = "EMPLOYEE",
): Promise<AuthResponse> => {
  const response = await authClient.post<AuthResponse>("/register", {
    name,
    email,
    password,
    role,
  });
  return response.data;
};
