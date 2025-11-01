export const fetchFriendIds = async (supabase, userId) => {
  if (!supabase?.isConfigured?.() || !userId) return [];

  const { data: sent, error: sentError } = await supabase
    .from("friends")
    .select("friend_id")
    .eq("user_id", userId)
    .eq("status", "accepted");

  const { data: received, error: receivedError } = await supabase
    .from("friends")
    .select("user_id")
    .eq("friend_id", userId)
    .eq("status", "accepted");

  if (sentError || receivedError) {
    console.warn(
      "[friends] fetchFriendIds error:",
      sentError?.message || receivedError?.message
    );
    return [];
  }

  const ids = new Set();
  sent?.forEach((row) => {
    if (row?.friend_id != null) ids.add(row.friend_id);
  });
  received?.forEach((row) => {
    if (row?.user_id != null) ids.add(row.user_id);
  });

  return Array.from(ids);
};

