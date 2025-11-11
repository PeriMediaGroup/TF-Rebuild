import { useEffect, useState } from "react";
import {
  fetchUserFriends,
  fetchIncomingRequests,
  fetchSentRequests, // 👈 ADD THIS!
  unfriend,
  respondToFriendRequest,
} from "./friendsApi";
import { useAuth } from "../../auth/AuthContext";
import { Link } from "react-router-dom";
import "../../styles/friends.scss";

const PROTECTED_USERNAMES = ["TF-One", "TriggerBot", "Admin_Account"];

const FriendsPanel = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const loadFriendsData = async () => {
    if (user?.id) {
      const friendsData = await fetchUserFriends(user.id);
      const incomingData = await fetchIncomingRequests(user.id);
      const sentData = await fetchSentRequests(user.id);
      setFriends(friendsData);
      setIncomingRequests(incomingData);
      setSentRequests(sentData);
    }
  };

  useEffect(() => {
    loadFriendsData();
  }, [user]);

  const sortedFriends = [...friends].sort((a, b) => {
    const isAProtected = PROTECTED_USERNAMES.includes(a.username);
    const isBProtected = PROTECTED_USERNAMES.includes(b.username);

    if (isAProtected && !isBProtected) return 1;
    if (!isAProtected && isBProtected) return -1;
    return (a.username || "").localeCompare(b.username || "");
  });

  const uniqueFriends = sortedFriends.filter(
    (friend, index, self) =>
      index === self.findIndex((f) => f.username === friend.username)
  );

  const handleAccept = async (fromUserId) => {
    await respondToFriendRequest(user.id, fromUserId, "accepted");
    await loadFriendsData();
  };

  const handleDecline = async (fromUserId) => {
    await respondToFriendRequest(user.id, fromUserId, "declined");
    await loadFriendsData();
  };

  return (<>
      <h2>Your Friends</h2>
    <div className="friends-panel">
      <div className="friends-panel__one">
        {!friends.length && <p>No friends yet.</p>}
        <ul className="friend-list">
          {uniqueFriends.map((f) => (
            <li key={f.id} className="friend-list__item">
              {!PROTECTED_USERNAMES.includes(f.username) ? (
                <a
                  className="friend-list__remove"
                  onClick={async () => {
                    const confirmed = window.confirm(
                      `Unfriend @${f.username}?`
                    );
                    if (confirmed) {
                      const success = await unfriend(user.id, f.id);
                      if (success) {
                        await loadFriendsData();
                      }
                    }
                  }}
                  title={`Unfriend @${f.username}`}
                />
              ) : (
                <span
                  className="friend-list__protected"
                  title="Protected User"
                />
              )}
              <Link to={`/user/${f.username}`} className="friend-link">
                @{f.username}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="friends-panel__two">
        <h4>Pending Friend Requests</h4>
        {!incomingRequests.length && (
          <p className="none">No incoming requests.</p>
        )}
        <ul className="friend-list">
          {incomingRequests.map((req) => (
            <li key={req.user_id} className="friend-list__item">
              <Link
                to={`/user/${req.profiles.username}`}
                className="friend-link"
              >
                @{req.profiles.username}
              </Link>
              <a
                className="accept-button"
                onClick={() => handleAccept(req.user_id)}
                title={`Accept @${req.profiles.username}`}
              >
                ✅
              </a>
              <a
                className="decline-button"
                onClick={() => handleDecline(req.user_id)}
                title={`Decline @${req.profiles.username}`}
              >
                ❌
              </a>
            </li>
          ))}
        </ul>
        {!sentRequests.length && <p className="none">No sent requests.</p>}
        <ul className="friend-list">
          <span>Waiting for response...</span>
          {sentRequests.map((req) => (
            <li key={req.friend_id}>
              @{req.profiles.username}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </>
  );
};

export default FriendsPanel;
