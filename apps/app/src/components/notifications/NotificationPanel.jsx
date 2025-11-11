import { useEffect, useState } from "react";
import { fetchNotifications, markNotificationAsRead } from "./notificationApi";
import { useNotifications } from "../../auth/NotificationContext";
import { deleteNotification } from "./deleteNotification";
import { useAuth } from "../../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { BackButton } from "../common";
import {
  respondToFriendRequest,
  fetchIncomingRequests,
} from "../friends/friendsApi";
import { formatLocalDateTime } from "../../utils/dateHelpers";
import "../../styles/notification.scss";

const NotificationsPanel = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const { unreadCount, refreshUnread } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const [notificationsData, requests] = await Promise.all([
        fetchNotifications(user.id),
        fetchIncomingRequests(user.id),
      ]);

      setNotifications(notificationsData);
      setIncomingRequests(requests);

      const updated = [];

      for (let notification of notificationsData) {
        if (!notification.is_read) {
          await markNotificationAsRead(notification.id);
          updated.push({ ...notification, is_read: true });
        }
      }

      refreshUnread();
      setNotifications(updated); // ✅ only show previously-unread ones
    };

    if (user) load();
  }, [user]);

  const isPendingRequest = (fromUserId) => {
    return incomingRequests.some((req) => req.user_id === fromUserId);
  };

  const handleRespond = async (fromUserId, notificationId, status) => {
    await respondToFriendRequest(user.id, fromUserId, status);
    await markNotificationAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, is_read: true, handled: true, status }
          : n
      )
    );
  };

  const renderNotification = (n) => {
    const { type, data, id } = n;

    switch (type) {
      case "mention":
        return (
          <div className="notification-item__mention">
            <p>
              <Link to={`/user/${encodeURIComponent(data.from_username)}`}>
                @{data.from_username}
              </Link>{" "}
              mentioned you in a post. &nbsp;
              <button
                className="notification-item__link-button"
                onClick={async () => {
                  await deleteNotification(id);
                  setNotifications((prev) => prev.filter((n) => n.id !== id)); // 🧹 Remove from screen
                  setTimeout(() => {
                    refreshUnread(); // wait for supabase to finish broadcasting
                  }, 200); // 💥 tweak this if needed
                  navigate(
                    `/posts/${data.post_id}` +
                      (data.comment_id ? `?commentId=${data.comment_id}` : "")
                  );
                }}
              >
                View Post
              </button>
            </p>
          </div>
        );

      case "friend_request":
        if (!isPendingRequest(data.from_user_id)) return null;

        return (
          <div className="notification-item__friend-request">
            <div className="notification-item__avatar">
              <img
                src={
                  data.from_profile_image_url || "/images/default-avatar.png"
                }
                alt="Avatar"
              />
            </div>
            <div className="notification-item__content">
              <p>
                <Link to={`/user/${encodeURIComponent(data.from_username)}`}>
                  @{data.from_username}
                </Link>{" "}
                sent you a friend request.
              </p>
              {!n.handled && (
                <div className="notification-item__actions">
                  <button
                    onClick={() =>
                      handleRespond(data.from_user_id, id, "accepted")
                    }
                  >
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      handleRespond(data.from_user_id, id, "declined")
                    }
                  >
                    Decline
                  </button>
                </div>
              )}
              {n.handled && n.status === "accepted" && (
                <p className="notification-item__handled">
                  Friend request accepted ✅
                </p>
              )}
              {n.handled && n.status === "declined" && (
                <p className="notification-item__handled">
                  Friend request declined ❌
                </p>
              )}
            </div>
          </div>
        );

      case "friend_accept":
        return (
          <div className="notification-item__friend-accept">
            <p>
              <Link to={`/user/${encodeURIComponent(data.from_username)}`}>
                @{data.from_username}
              </Link>{" "}
              accepted your friend request. &nbsp;
              <button
                onClick={async () => {
                  await deleteNotification(id);
                  setNotifications((prev) => prev.filter((n) => n.id !== id)); // 🧹 Remove it from screen
                  refreshUnread(); // 🔄 Update badge count
                }}
              >
                Dismiss
              </button>
            </p>
          </div>
        );

      case "moderation":
        return (
          <div className="notification moderation">
            <p className="notification__text">{n.data.reason}</p>
            <blockquote className="notification__block">
              <strong>{n.data.post_title}</strong>
              <br />
              {n.data.post_description}
            </blockquote>
            <small className="notification__timestamp">
              {formatLocalDateTime(n.data.deleted_at)}
            </small>
            <button
              onClick={async () => {
                await deleteNotification(n.id);
                setNotifications((prev) => prev.filter((x) => x.id !== n.id));
                refreshUnread();
              }}
            >
              Dismiss
            </button>
          </div>
        );
      case "promotion":
        return (
          <div className="notification promotion">
            <p className="notification__text">{n.data.message}</p>
            <small className="notification__timestamp">
              {formatLocalDateTime(n.data.promoted_at)}
            </small>
            <button
              onClick={async () => {
                await deleteNotification(n.id);
                setNotifications((prev) => prev.filter((x) => x.id !== n.id));
                refreshUnread();
              }}
            >
              Dismiss
            </button>
          </div>
        );
      default:
        return (
          <div className="notification-item__default">
            <strong>{type.replace("_", " ")}</strong>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        );
    }
  };

  return (
    <div className="notifications-panel">
      <h2>Notifications</h2>
      {!notifications.length && (
        <p className="notifications-panel__empty">You have no notifications.</p>
      )}
      <ul className="notifications-list">
        {notifications.map((n) => {
          const content = renderNotification(n);
          return content ? (
            <li
              key={n.id}
              className={`notification-item ${n.is_read ? "" : "unread"}`}
            >
              {content}
            </li>
          ) : null;
        })}
      </ul>
      <BackButton />
    </div>
  );
};

export default NotificationsPanel;
