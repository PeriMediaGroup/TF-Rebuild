
import { useNavigate } from "react-router-dom";
import "../../styles/messages.scss";

const StartMessageButton = ({ targetUserId, username }) => {
  const navigate = useNavigate();

  const handleStartMessage = () => {
    if (!targetUserId) return;
    navigate(`/messages/${targetUserId}`);
  };

  return (
    <button className="start-message-button" onClick={handleStartMessage}>
      💬 Message @{username || "User"}
    </button>
  );
};

export default StartMessageButton;
