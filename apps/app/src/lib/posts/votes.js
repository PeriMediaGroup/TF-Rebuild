export const fetchVoteState = async (supabase, postId, userId) => {
  if (!supabase?.isConfigured?.() || !postId) {
    return { up: 0, down: 0, userVote: null };
  }

  const { data, error } = await supabase
    .from("post_votes")
    .select("user_id, value")
    .eq("post_id", postId);

  if (error) {
    console.warn("[votes] fetchVoteState error:", error.message);
    return { up: 0, down: 0, userVote: null };
  }

  let up = 0;
  let down = 0;
  let userVote = null;

  (data || []).forEach((row) => {
    if (row.value === 1) up += 1;
    if (row.value === -1) down += 1;
    if (row.user_id === userId) {
      userVote = row.value === 1 ? "up" : row.value === -1 ? "down" : null;
    }
  });

  return { up, down, userVote };
};

export const toggleVote = async (supabase, { postId, userId, type }) => {
  if (!supabase?.isConfigured?.() || !postId || !userId) {
    return { success: false, error: "not-authenticated" };
  }

  const desiredValue = type === "up" ? 1 : -1;

  const { data: existing, error: fetchError } = await supabase
    .from("post_votes")
    .select("id, value")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    console.warn("[votes] toggle fetch error:", fetchError.message);
    return { success: false, error: fetchError.message };
  }

  if (existing) {
    if (existing.value === desiredValue) {
      const { error } = await supabase
        .from("post_votes")
        .delete()
        .eq("id", existing.id);
      if (error) {
        console.warn("[votes] delete error:", error.message);
        return { success: false, error: error.message };
      }
      return { success: true, removed: true };
    }

    const { error } = await supabase
      .from("post_votes")
      .update({ value: desiredValue })
      .eq("id", existing.id);
    if (error) {
      console.warn("[votes] update error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true, updated: true };
  }

  const { error } = await supabase
    .from("post_votes")
    .insert([{ post_id: postId, user_id: userId, value: desiredValue }]);

  if (error) {
    console.warn("[votes] insert error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, created: true };
};

