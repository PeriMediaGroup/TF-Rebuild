import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { toast } from "react-toastify";
import {
    sendFriendRequest,
    respondToFriendRequest,
    fetchIncomingRequests,
    fetchSentRequests,
    fetchUserFriends 
  } from "./friendsApi";

const FriendActions = ({ targetUserId }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState(null); // "none", "pending", "incoming", "friends"

  useEffect(() => {
    const loadStatus = async () => {
      if (!user || user.id === targetUserId) return;
  
      const incoming = await fetchIncomingRequests(user.id);
      const sent = await fetchSentRequests(user.id);
      const friends = await fetchUserFriends(user.id);
  
      if (friends.some((f) => f.id === targetUserId)) {
        setStatus("friends");
      } else if (incoming.some((req) => req.user_id === targetUserId)) {
        setStatus("incoming");
      } else if (sent.some((req) => req.friend_id === targetUserId)) {
        setStatus("pending");
      } else {
        setStatus("none");
      }
    };
  
    loadStatus();
  }, [user, targetUserId]);
  

  const handleSend = async () => {
    const success = await sendFriendRequest(
      user.id,
      targetUserId,
      user.username,
      user.profile_image_url || "/images/default-avatar.png"
    );
    if (success) setStatus("pending");
    toast.success("Friend request sent!");
  };

  const handleAccept = async () => {
    const success = await respondToFriendRequest(user.id, targetUserId, "accepted");
    if (success) setStatus("friends");
  };

  if (!user || user.id === targetUserId) return null;

  return (
    <div className="friend-actions">
      {status === "none" && <button onClick={handleSend}>Add Friend</button>}
      {status === "pending" && <span>Friend Request Sent</span>}
      {status === "incoming" && ( <button onClick={handleAccept}>Accept Friend Request</button> )}
      {status === "friends" && <span>✓ Friends</span>}
    </div>
  );
};

export default FriendActions;
