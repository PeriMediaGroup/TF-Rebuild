import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { fetchUserFriends } from "../utils/supabaseHelpers";

const Friends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const loadFriends = async () => {
      if (!user) return;
      const list = await fetchUserFriends(user.id);
      setFriends(list);
    };

    loadFriends();
  }, [user]);

  return (
    <div className="friends">
      <h4>Your Friends</h4>
      {friends.length === 0 ? (
        <p>No friends yet.</p>
      ) : (
        <ul>
          {friends.map((f) => (
            <li key={f.id}>
            <Link to={`/user/${f.username}`}>@{f.username}</Link>
          </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Friends;
