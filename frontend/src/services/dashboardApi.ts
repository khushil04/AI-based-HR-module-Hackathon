import { api } from "../utils/api";

export const getDashboardApi = async () => {
  const res = await api.get("/dashboard");
  return res.data as { type: string; data: Record<string, unknown> };
};
