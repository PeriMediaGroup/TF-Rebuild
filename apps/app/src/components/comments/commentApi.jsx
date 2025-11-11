import supabase from "../../utils/supabaseClient";
import { createNotification } from "../notifications/notificationApi";

// Add a new comment
export const addComment = async ({
  postId,
  userId,
  text,
  imageUrl = null,
  parentId = null,
  postOwnerId,
  commenterUsername,
}) => {
  const { data, error } = await supabase
    .from("comments")
    .insert([
      {
        post_id: postId,
        user_id: userId,
        text,
        image_url: imageUrl,
        parent_id: parentId,
      },
    ])
    .select("*, profiles (username, profile_image_url)")
    .single();

  if (error) {
    console.error("Add comment error:", error.message);
    return null;
  }

  // Send notification if someone else owns the post
  if (userId !== postOwnerId && postOwnerId) {
    await createNotification({
      user_id: postOwnerId,
      type: "comment",
      data: {
        post_id: postId,
        from_user_id: userId,
        from_username: commenterUsername,
        text,
      },
    });
  }

  return data;
};

// Edit Comment 
export const updateComment = async (commentId, newText) => {
  const { error } = await supabase
    .from("comments")
    .update({ text: newText, updated_at: new Date().toISOString() })
    .eq("id", commentId);

  if (error) throw new Error(error.message);
};

// Delete comment
export const deleteComment = async (commentId, userId) => {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", userId);

  if (error) {
    console.error("Delete comment error:", error.message);
    return false;
  }

  return true;
};

// Fetch comments by postId
export const fetchComments = async (postId) => {
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles (username, profile_image_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Fetch comments error:", error.message);
    return [];
  }

  return data;
};
