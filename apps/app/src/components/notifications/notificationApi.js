import supabase from "../../utils/supabaseClient";

export const fetchNotifications = async (userId) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return error ? [] : data;
};

export const markNotificationAsRead = async (notificationId) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true }) // ✅ removed stray )
    .eq("id", notificationId);

  if (error) {
    console.error("❌ Failed to mark notification as read:", error.message);
  } else {
    console.log("✅ Marked as read:", notificationId);
  }
};

export const createNotification = async ({ user_id, type, data }) => {
  if (!user_id) {
    console.warn("createNotification: user_id is missing. Notification not sent.");
    return { success: false, error: "Missing user_id" };
  }

  const payload = {
    user_id,
    type,
    data: typeof data === "object" ? data : {},
    is_read: false,
  };

  const { error } = await supabase.from("notifications").insert([payload]);

  if (error) {
    console.error("Notification insert error:", error.message);
  }

  return { success: !error, error };
};

