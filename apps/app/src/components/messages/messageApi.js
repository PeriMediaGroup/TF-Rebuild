import supabase from "../../utils/supabaseClient";

// Fetch conversations for inbox
export const fetchConversations = async (userId) => {
  const { data, error } = await supabase.rpc("get_conversations", {
    current_user_id: userId,
  });
  if (error) throw new Error(error.message);
  return data;
};

// Fetch full message thread
export const fetchMessageThread = async (userId, otherUserId) => {
  if (!userId || !otherUserId) return [];
  const { data, error } = await supabase
    .from("private_messages")
    .select("*, sender:profiles!private_messages_sender_id_fkey(username)")
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  // Flatten structure for easier frontend use
  const normalized = data.map((msg) => ({
    ...msg,
    sender_name: msg.sender?.username || "Unknown",
  }));

  return normalized;
};

// Send a message
export const sendMessage = async (fromId, toId, content) => {
  const { error } = await supabase.from("private_messages").insert({
    sender_id: fromId,
    recipient_id: toId,
    content: content.trim(),
  });
  if (error) throw new Error(error.message);
};

// Mark messages as read
export const markMessagesAsRead = async (recipientId, senderId) => {
  await supabase
    .from("private_messages")
    .update({ read: true })
    .eq("recipient_id", recipientId)
    .eq("sender_id", senderId)
    .eq("read", false);
};

// Get unread DM count
export const fetchUnreadDMCount = async (userId) => {
  const { count, error } = await supabase
    .from("private_messages")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .eq("read", false);

  if (error) throw new Error(error.message);
  return count || 0;
};
