import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllUsers } from "../profiles/profileApi";
import defaultAvatar from "/images/default-avatar.png"; // adjust path if needed
import "../../styles/userlist.scss";

const PROTECTED_USERNAMES = ["TF-One", "TriggerBot", "Admin_Account"];

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      const data = await getAllUsers();
      setUsers(data);
    };
    loadUsers();
  }, []);

  const sortedUsers = [...users].sort((a, b) => {
    const isAProtected = PROTECTED_USERNAMES.includes(a.username);
    const isBProtected = PROTECTED_USERNAMES.includes(b.username);

    if (isAProtected && !isBProtected) return 1;
    if (!isAProtected && isBProtected) return -1;
    return (a.username || "").localeCompare(b.username || "");
  });


  if (!users.length) return <p className="user-list__empty">No users found.</p>;

  return (
    <ul className="user-list">
      <h2>Members</h2>
      {sortedUsers.map((user) => (
        <li key={user.id} className="user-list__item">
          <Link to={`/user/${user.username}`} className="user-list__link">
            <div className="user-list__avatar">
              <img
                src={user.profile_image_url || defaultAvatar}
                alt={user.username}
              />
            </div>
            <div className="user-list__info">
              <span className="user-list__name">{user.username}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default UserList;
