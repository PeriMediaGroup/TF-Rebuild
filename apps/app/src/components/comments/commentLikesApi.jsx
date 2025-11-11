import supabase from "../../utils/supabaseClient";

export const fetchCommentLikes = async (commentIds = []) => {
  if (!commentIds.length) return {};

  const { data, error } = await supabase
    .from("comment_likes")
    .select("comment_id")
    .in("comment_id", commentIds);

  if (error) {
    console.error("Error fetching comment likes:", error.message);
    return {};
  }

  const counts = {};
  for (const { comment_id } of data) {
    counts[comment_id] = (counts[comment_id] || 0) + 1;
  }
  return counts;
};

export const getUserCommentLikes = async (userId) => {
  const { data, error } = await supabase
    .from("comment_likes")
    .select("comment_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error getting user comment likes:", error.message);
    return [];
  }

  return data.map((d) => d.comment_id);
};

export const toggleCommentLike = async (commentId, userId) => {
  const { data: existing, error: fetchError } = await supabase
    .from("comment_likes")
    .select("id")
    .eq("comment_id", commentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Toggle fetch error:", fetchError.message);
    return false;
  }

  if (existing) {
    const { error: deleteError } = await supabase
      .from("comment_likes")
      .delete()
      .eq("id", existing.id);
    if (deleteError) {
      console.error("Unlike failed:", deleteError.message);
      return false;
    }
    return false; // now unliked
  } else {
    const { error: insertError } = await supabase
      .from("comment_likes")
      .insert([{ comment_id: commentId, user_id: userId }]);
    if (insertError) {
      console.error("Like failed:", insertError.message);
      return false;
    }
    return true; // now liked
  }
};