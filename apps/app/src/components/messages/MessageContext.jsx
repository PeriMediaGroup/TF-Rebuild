import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { fetchUnreadDMCount } from "./messageApi";

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadDMCount, setUnreadDMCount] = useState(0);

  const refreshUnreadDMs = async () => {
    if (!user?.id) return;
    try {
      const count = await fetchUnreadDMCount(user.id); // ✅ use correct function name
      setUnreadDMCount(count);
    } catch (err) {
      console.error("Error refreshing DM count:", err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      refreshUnreadDMs();
    }
  }, [user]);

  return (
    <MessageContext.Provider value={{ unreadDMCount, refreshUnreadDMs }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => useContext(MessageContext);
