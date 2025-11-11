import dayjs from "dayjs";

const MessageBubble = ({ msg, isSelf }) => {
  return (
    <>
      <div
        className={`message-bubble ${isSelf ? "message-bubble--self" : "message-bubble--other"}`}
      >
        <div className="message-bubble__meta">
          {!isSelf && msg.sender_name && (
            <span className="message-bubble__sender">{msg.sender_name} @ </span>
          )}
          <span className="message-bubble__time">
             &nbsp;{dayjs(msg.created_at).format("h:mm A")}
          </span>
        </div>
        <p className="message-bubble__text">{msg.content}</p>
      </div>
    </>
  );
};

export default MessageBubble;
