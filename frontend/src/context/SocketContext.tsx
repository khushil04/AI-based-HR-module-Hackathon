import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { fetchNotificationsApi } from "../services/notificationApi";
import { useAuth } from "./AuthContext";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000";

export interface AppNotification {
  id: string;
  type: string;
  message: string;
  at: string;
}

interface SocketContextValue {
  notifications: AppNotification[];
  connected: boolean;
  clearNotifications: () => void;
  refreshNotifications: () => Promise<void>;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

const mergeNotifications = (
  prev: AppNotification[],
  incoming: AppNotification[],
): AppNotification[] => {
  const map = new Map<string, AppNotification>();
  [...incoming, ...prev].forEach((n) => {
    const key = n.id || `${n.type}-${n.at}`;
    map.set(key, n);
  });
  return Array.from(map.values())
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 30);
};

const toAppNotification = (payload: {
  id?: string;
  type: string;
  message: string;
  at?: string;
}): AppNotification => ({
  id: payload.id ?? `${Date.now()}-${Math.random()}`,
  type: payload.type,
  message: payload.message,
  at: payload.at ?? new Date().toISOString(),
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const refreshNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const list = await fetchNotificationsApi();
      setNotifications((prev) => mergeNotifications(prev, list));
    } catch {
      // API may be down; socket can still work
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setConnected(false);
      setNotifications([]);
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    void refreshNotifications();
    const poll = window.setInterval(() => void refreshNotifications(), 15000);

    const socket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      withCredentials: true,
      auth: { token },
    });

    socketRef.current = socket;

    const authenticate = () => {
      socket.emit("authenticate", token);
    };

    socket.on("connect", authenticate);

    socket.on("authenticated", () => {
      setConnected(true);
      void refreshNotifications();
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("connect_error", () => setConnected(false));

    socket.on("error", (payload: { message?: string }) => {
      console.warn("Socket auth error:", payload?.message ?? payload);
      setConnected(false);
    });

    socket.on("notification", (payload: { id?: string; type: string; message: string; at?: string }) => {
      setNotifications((prev) =>
        mergeNotifications(prev, [toAppNotification(payload)]),
      );
    });

    return () => {
      window.clearInterval(poll);
      socket.removeAllListeners();
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
      setConnected(false);
    };
  }, [token, refreshNotifications]);

  const value = useMemo(
    () => ({
      notifications,
      connected,
      clearNotifications: () => setNotifications([]),
      refreshNotifications,
    }),
    [notifications, connected, refreshNotifications],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = (): SocketContextValue => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};
