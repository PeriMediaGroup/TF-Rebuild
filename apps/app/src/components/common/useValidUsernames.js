import { useEffect, useState } from "react";
import supabase from "../../utils/supabaseClient";

const useValidUsernames = () => {
  const [usernames, setUsernames] = useState({});

  useEffect(() => {
    const fetchUsernames = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username");

      if (error) {
        console.error("Error fetching usernames:", error.message);
        return;
      }

      const map = {};
      data.forEach((user) => {
        if (user.username) {
          map[user.username.toLowerCase()] = true;
        }
      });

      setUsernames(map);
    };

    fetchUsernames();
  }, []);

  return usernames;
};

export default useValidUsernames;