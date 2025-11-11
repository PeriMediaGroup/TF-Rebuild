// /src/posts/voteApi.js
import supabase from "../../utils/supabaseClient";

export const getVotes = async () => {
  const { data, error } = await supabase.from("post_votes").select("post_id, value");

  if (error) {
    console.error("Error fetching votes:", error.message);
    return {};
  }

  const voteTally = {};

  data.forEach(({ post_id, value }) => {
    if (!voteTally[post_id]) voteTally[post_id] = 0;
    voteTally[post_id] += value;
  });

  return voteTally;
};

export const getUserVote = async (postId, userId) => {
  const { data, error } = await supabase
    .from("post_votes")
    .select("value")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle(); // ✅ won't throw on 0 results

  if (error) {
    console.error("Error getting vote:", error.message);
    return null;
  }

  return data?.value ?? null;
};

export const toggleVote = async (postId, userId, value) => {
  const existing = await getUserVote(postId, userId);

  // If same vote again, remove it (toggle off)
  if (existing === value) {
    await supabase
      .from("post_votes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    return null;
  }

  // Upsert (insert or update)
  const { error } = await supabase
    .from("post_votes")
    .upsert([{ post_id: postId, user_id: userId, value }], {
      onConflict: ["post_id", "user_id"],
    });

  if (error) console.error("Vote error:", error.message);
  return value;
};
