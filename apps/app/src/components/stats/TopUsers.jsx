import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../../utils/supabaseClient";

const TopUsers = () => {
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const { data: postsData } = await supabase
          .from("posts")
          .select("user_id");

        const { data: commentsData } = await supabase
          .from("comments")
          .select("user_id");

        const counts = {};

        postsData?.forEach(({ user_id }) => {
          counts[user_id] = (counts[user_id] || 0) + 1;
        });

        commentsData?.forEach(({ user_id }) => {
          counts[user_id] = (counts[user_id] || 0) + 1;
        });

        const sorted = Object.entries(counts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5);

        const profiles = await Promise.all(
          sorted.map(async ([userId]) => {
            const { data, error } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", userId)
              .single();

            return data?.username || "Unknown";
          })
        );

        setTopUsers(profiles);
      } catch (err) {
        console.error("Error loading top users:", err.message);
        setTopUsers([]);
      }
    };

    fetchTopUsers();
  }, []);

  return (
    <ul className="top-users">
      {topUsers.map((username, index) => (
        <li key={index} className="top-users__link">
          <Link to={`/user/${username}`}>@{username}</Link>
        </li>
      ))}
    </ul>
  );
};

export default TopUsers;
