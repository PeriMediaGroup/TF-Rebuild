import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  fetchMessageThread,
  sendMessage,
  markMessagesAsRead,
} from "./messageApi";
import { useMessages } from "./MessageContext";
import { groupMessagesByDay } from "./groupMessagesByDay";
import MessageBubble from "./MessageBubble";
import { Link } from "react-router-dom";

const MessageThread = () => {
  const { user } = useAuth();
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const grouped = groupMessagesByDay(messages);
  const { refreshUnreadDMs } = useMessages();

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const data = await fetchMessageThread(user.id, userId);
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error.message);
      }
    };

    fetchThread();
  }, [user.id, userId]);

  useEffect(() => {
    if (user?.id && userId && typeof refreshUnreadDMs === "function") {
      const timer = setTimeout(async () => {
        await markMessagesAsRead(user.id, userId);
        refreshUnreadDMs();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user?.id, userId, refreshUnreadDMs]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!text.trim()) return;

    try {
      await sendMessage(user.id, userId, text);
      setMessages([
        ...messages,
        {
          sender_id: user.id,
          recipient_id: userId,
          content: text.trim(),
          created_at: new Date().toISOString(),
        },
      ]);
      setText("");
    } catch (error) {
      console.error("Send failed:", error.message);
    }
  };

  return (
    <div className="message-thread">
      <div className="message-thread__header">
        <h2 className="message-thread__title">Private Messages</h2>
        <Link to="/messages" className="message-thread__back">
          Back to Inbox
        </Link>
      </div>
      <div className="message-thread__messages">
        {grouped.map(({ date, messages }) => (
          <div key={date} className="message-thread__day-group">
            <div className="message-thread__date">{date}</div>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id || msg.created_at}
                msg={msg}
                isSelf={msg.sender_id === user.id}
              />
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-thread__input">
        <input
          type="text"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default MessageThread;