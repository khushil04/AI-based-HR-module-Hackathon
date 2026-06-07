import { Notification, INotification } from "../models/Notification";
import { User } from "../models/User";
import { UserRole } from "../types/auth";
import { emitToUser, emitToUsers } from "../sockets/index";

export interface NotificationPayload {
  type: string;
  message: string;
  [key: string]: unknown;
}

const formatNotification = (doc: INotification) => ({
  id: doc._id,
  type: doc.type,
  message: doc.message,
  data: doc.data,
  read: doc.read,
  at: doc.createdAt.toISOString(),
});

const resolveUserIds = async (opts: {
  roles?: UserRole[];
  userIds?: string[];
}): Promise<string[]> => {
  const ids = new Set<string>(opts.userIds ?? []);

  if (opts.roles?.length) {
    const users = await User.find({ role: { $in: opts.roles } }).select("_id");
    users.forEach((u) => ids.add(String(u._id)));
  }

  return Array.from(ids);
};

/** Save to DB and push over Socket.io (reliable even if socket was briefly offline). */
export const pushNotification = async (
  targets: { roles?: UserRole[]; userIds?: string[] },
  payload: NotificationPayload,
): Promise<void> => {
  const userIds = await resolveUserIds(targets);
  if (userIds.length === 0) return;

  const docs = await Notification.insertMany(
    userIds.map((userId) => ({
      userId,
      type: payload.type,
      message: payload.message,
      data: payload,
      read: false,
    })),
  );

  docs.forEach((doc) => {
    emitToUsers([String(doc.userId)], [
      {
        id: String(doc._id),
        type: doc.type,
        message: doc.message,
        at: (doc.createdAt ?? new Date()).toISOString(),
      },
    ]);
  });
};

export const listNotifications = async (userId: string, limit = 30) => {
  const docs = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
  return docs.map(formatNotification);
};

export const markNotificationsRead = async (userId: string, ids?: string[]) => {
  const filter: Record<string, unknown> = { userId, read: false };
  if (ids?.length) {
    filter._id = { $in: ids };
  }
  await Notification.updateMany(filter, { read: true });
};

export const syncUnreadToSocket = async (userId: string): Promise<void> => {
  const unread = await Notification.find({ userId, read: false })
    .sort({ createdAt: -1 })
    .limit(20);
  if (unread.length === 0) return;
  emitToUsers(
    [userId],
    unread.map((doc) => formatNotification(doc)),
  );
};
