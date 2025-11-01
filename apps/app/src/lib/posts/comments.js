export const fetchCommentCount = async (supabase, postId) => {
  if (!supabase?.isConfigured?.() || !postId) return 0;

  const { count, error } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);

  if (error) {
    console.warn("[comments] count error:", error.message);
    return 0;
  }

  return count ?? 0;
};

export const fetchComments = async (supabase, postId) => {
  if (!supabase?.isConfigured?.() || !postId) return [];

  const { data, error } = await supabase
    .from("comments")
    .select(
      `
        id,
        post_id,
        user_id,
        text,
        parent_id,
        image_url,
        updated_at,
        created_at,
        profiles ( username, profile_image_url )
      `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("[comments] fetch error:", error.message);
    return [];
  }

  return (data || []).map((row) => ({
    ...row,
    body: row.text ?? row.content ?? row.body ?? "",
  }));
};

const insertCommentPayloads = (postId, userId, text) => [
  { post_id: postId, user_id: userId, text },
  { post_id: postId, user_id: userId, content: text },
];

export const addComment = async (supabase, { postId, userId, text }) => {
  if (!supabase?.isConfigured?.() || !postId || !userId || !text?.trim()) {
    return { success: false, error: "invalid-input" };
  }

  const payloads = insertCommentPayloads(postId, userId, text.trim());

  for (const payload of payloads) {
    const { data, error } = await supabase
      .from("comments")
      .insert([payload])
      .select("id")
      .single();

    if (!error) {
      return { success: true, id: data?.id ?? null };
    }

    if (!/column.*(text|content).*does not exist/i.test(error.message)) {
      console.warn("[comments] insert error:", error.message);
      return { success: false, error: error.message };
    }
  }

  return { success: false, error: "insert-failed" };
};

export const deleteComment = async (supabase, { commentId, userId, isElevated }) => {
  if (!supabase?.isConfigured?.() || !commentId) return { success: false };

  const query = supabase.from("comments").delete().eq("id", commentId);
  if (!isElevated && userId) {
    query.eq("user_id", userId);
  }

  const { error } = await query;
  if (error) {
    console.warn("[comments] delete error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
};

export const subscribeToComments = (supabase, postId, handler) => {
  if (!supabase?.isConfigured?.() || !postId) return () => {};

  const channel = supabase
    .channel(`comments-${postId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${postId}` },
      handler
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
