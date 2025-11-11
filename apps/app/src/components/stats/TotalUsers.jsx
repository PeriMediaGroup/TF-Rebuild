import { useEffect, useState } from "react";
import supabase from "../../utils/supabaseClient";

const TotalUsers = () => {
  const [count, setCount] = useState(null);

  useEffect(() => {
    const fetchUserCount = async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (!error) setCount(count);
    };

    fetchUserCount();
  }, []);

  return (
    <div className="stats__total-users">
      <span>Total Users: {count ?? "Loading..."}</span>
    </div>
  );
};

export default TotalUsers;
