import { createContext, useContext, useState, useEffect } from "react";
import supabase from "../utils/supabaseClient";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = async () => {
    if (!user) return;
  
    const { data, error } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_read", false);
  
    if (!error && data) {
      setUnreadCount(data.length);
    } else {
      console.error("❌ Failed to refresh unread:", error?.message);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    refreshUnread(); // Initial load

    const channel = supabase
      .channel(`realtime:notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("🔄 Realtime notification change:", payload);
          refreshUnread();
        }
      )
      .subscribe();
      // console.log("👂 Subscribed to realtime for user:", user.id); 

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]); // 💡 ensures re-subscribe when user becomes available

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnread }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
