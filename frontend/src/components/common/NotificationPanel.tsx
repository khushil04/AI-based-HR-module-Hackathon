import { useSocket } from "../../hooks/useSocket";

const NotificationPanel = () => {
  const { notifications, connected, clearNotifications } = useSocket();

  return (
    <div className="panel notifications">
      <div className="notifications-header">
        <h3 className="panel-title" style={{ margin: 0 }}>
          Notifications
        </h3>
        <span
          className={`status-dot ${connected ? "online" : "offline"}`}
          title={
            connected
              ? "Live — you will receive real-time alerts"
              : "Connecting… keep this tab open while logged in"
          }
        />
      </div>
      {notifications.length > 0 && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={clearNotifications}>
          Clear all
        </button>
      )}
      {notifications.length === 0 ? (
        <p className="muted" style={{ margin: "12px 0 0" }}>
          You&apos;re all caught up
        </p>
      ) : (
        <ul className="notification-list">
          {notifications.map((n) => (
            <li key={n.id}>
              <span className="notif-type">{n.type.replace(/_/g, " ")}</span>
              <p>{n.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationPanel;
