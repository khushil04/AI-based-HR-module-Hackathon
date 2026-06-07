import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { isAllowedOrigin } from "../config/cors";
import { env } from "../config/env";
import { syncUnreadToSocket } from "../services/notificationService";
import { UserRole } from "../types/auth";

let io: Server | null = null;

const roleToRoom = (role: UserRole): string => `${role.toLowerCase()}-room`;
const userRoom = (userId: string): string => `user-${userId}`;

const joinUserRooms = async (socket: Socket, userId: string, role: UserRole): Promise<void> => {
  socket.data.userId = userId;
  socket.data.role = role;
  socket.join(roleToRoom(role));
  socket.join(userRoom(userId));
  socket.join("all-users");
  socket.emit("authenticated", { role });
  await syncUnreadToSocket(userId);
};

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    path: "/socket.io",
    cors: {
      origin: (origin, callback) => {
        callback(null, isAllowedOrigin(origin));
      },
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    const authFromHandshake = socket.handshake.auth as { token?: string };

    const tryAuth = async (token: string) => {
      try {
        const decoded = jwt.verify(token, env.jwtSecret) as { id: string; role: UserRole };
        await joinUserRooms(socket, decoded.id, decoded.role);
      } catch {
        socket.emit("error", { message: "Invalid token" });
      }
    };

    if (authFromHandshake?.token) {
      void tryAuth(authFromHandshake.token);
    }

    socket.on("authenticate", (token: string) => {
      void tryAuth(token);
    });
  });

  return io;
};

export const emitToUser = (userId: string, payload: Record<string, unknown>): void => {
  if (!io || !userId) return;
  io.to(userRoom(userId)).emit("notification", payload);
};

export const emitToUsers = (
  userIds: string[],
  payloads: Record<string, unknown>[],
): void => {
  userIds.forEach((userId, index) => {
    const payload = payloads[index] ?? payloads[0];
    if (payload) emitToUser(userId, payload);
  });
};

/** @deprecated Use pushNotification from notificationService */
export const notifyRoles = (
  roles: UserRole[],
  event: string,
  payload: Record<string, unknown>,
): void => {
  if (!io) return;
  roles.forEach((role) => {
    io!.to(roleToRoom(role)).emit(event, payload);
  });
};

export const notifyAll = (event: string, payload: Record<string, unknown>): void => {
  if (!io) return;
  io.to("all-users").emit(event, payload);
};

/** @deprecated Use pushNotification from notificationService */
export const notifyUser = (
  userId: string,
  event: string,
  payload: Record<string, unknown>,
): void => {
  emitToUser(userId, payload);
};
