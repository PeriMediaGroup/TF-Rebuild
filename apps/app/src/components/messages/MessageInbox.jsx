import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { fetchConversations } from "./messageApi";
import { formatLocalDateTime } from "../../utils/dateHelpers.js";
import { Link } from "react-router-dom";
import { useMessages } from "./MessageContext";

const MessageInbox = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { unreadDMCount, refreshDMCount } = useMessages();

  useEffect(() => {
    const fetchConversationsHandler = async () => {
      try {
        const data = await fetchConversations(user.id);

        const sorted = data.sort((a, b) => {
          if (a.unread !== b.unread) return b.unread - a.unread;
          return new Date(b.last_sent_at) - new Date(a.last_sent_at);
        });

        setConversations(sorted);
      } catch (error) {
        console.error("Failed to load conversations:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversationsHandler();
  }, [user]);

  if (loading) return <p>Loading messages...</p>;

  return (
    <div className="inbox">
      <h2 className="inbox__title">📨 Messages</h2>
      {conversations.length === 0 ? (
        <p className="inbox__empty">No messages yet.</p>
      ) : (
        <ul className="inbox__list">
          {conversations.map((convo) => (
            <li key={`${convo.user_id}-${convo.last_sent_at}`} className="inbox__item">
              <Link
                to={`/messages/${convo.user_id}`}
                className="inbox__link"
                onClick={() => {
                  if (convo.unread) {
                    setTimeout(() => {
                      refreshDMCount?.();
                    }, 1000);
                  }
                }}
              >
                {convo.unread && <span className="inbox__badge">🟢</span>}
                <span className="inbox__user">@{convo.username}</span>
                <span className="inbox__timestamp">
                  {convo.last_sent_at ? formatLocalDateTime(convo.last_sent_at) : "No messages yet"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MessageInbox;
