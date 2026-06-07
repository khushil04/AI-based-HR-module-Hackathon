import { api } from "../utils/api";
import type { AppNotification } from "../context/SocketContext";

export const fetchNotificationsApi = async (): Promise<AppNotification[]> => {
  const res = await api.get<{ notifications: AppNotification[] }>("/notifications");
  return res.data.notifications;
};

export const markNotificationsReadApi = async (ids?: string[]): Promise<void> => {
  await api.patch("/notifications/read", ids ? { ids } : {});
};
