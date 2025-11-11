import { useEffect, useState } from "react";
import supabase from "../../utils/supabaseClient";

const RecentMembers = ({ limit = 5 }) => {
  const [recentMembers, setRecentMembers] = useState([]);

  useEffect(() => {
    const fetchRecentMembers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching recent members:", error.message);
      } else {
        setRecentMembers(data);
      }
    };

    fetchRecentMembers();
  }, [limit]);

  return (
    <div className="recent-members">
      <h3 className="recent-memebers__title">New Members</h3>
      <ul>
        {recentMembers.map((user, index) => (
          <li key={index} className="recent-members__link">
            @{user.username || "Unnamed"} — {new Date(user.created_at).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentMembers;
