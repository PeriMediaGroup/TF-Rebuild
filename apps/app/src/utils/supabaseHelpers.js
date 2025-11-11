import toast from "react-hot-toast";
import supabase from "./supabaseClient";

export const signUp = async (email, password, navigate) => {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    toast.error(`Signup Error: ${error?.message ?? "Unexpected signup error"}`);
    return { success: false, error: error.message };
  }

  toast.success("Signup successful! Check your email.");
  navigate("/verify-email");
  return { success: true };
};

export const signInWithProvider = async (provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider, // 'google' or 'facebook'
    options: {
      redirectTo: window.location.origin, // or custom redirect URI
    },
  });

  if (error) {
    toast.error("OAuth login error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, data };
};

export const logIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    toast.error("Login error:", error.message);
    return { success: false, error: error.message }; // Surface the actual issue
  }

  return { success: true, user: data.user };
};

export const logOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};

export const getUserSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
};

// ✅ Posts
export const createPost = async (post) => {
  const { error: insertError } = await supabase.from("posts").insert([{
    user_id: userId,
    title: title,
    description: text,
    image_url: imageUrl,
    visibility,
    shared_with: sharedWith ? sharedWith : null,
    sticky: false, // or pass `sticky` as a param if needed
  }]);
  if (error) throw new Error(error.message);
};

export const fetchPosts = async (view = "main", currentUserId = null) => {
  let query = supabase.from("posts").select("*").order("created_at", { ascending: false });

  if (view === "main") {
    if (currentUserId) {
      // Show public + friends' posts
      const { data: friends } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", currentUserId);

      const friendIds = friends?.map((f) => f.friend_id) || [];

      query = query.in("user_id", [currentUserId, ...friendIds]).or("visibility.eq.public");
    } else {
      // Not logged in: only public
      query = query.eq("visibility", "public");
    }
  }

  if (view === "friends") {
    const { data: friends } = await supabase
      .from("friends")
      .select("friend_id")
      .eq("user_id", currentUserId);

    const friendIds = friends?.map((f) => f.friend_id) || [];
    query = query.in("user_id", friendIds);
  }

  if (view === "trending") {
    let baseQuery = supabase.from("post_scores").select("post_id").order("score", { ascending: false });
    const { data: topPostIds } = await baseQuery;

    let postQuery = supabase.from("posts").select("*").in("id", topPostIds.map(p => p.post_id));

    if (!currentUserId) {
      postQuery = postQuery.eq("visibility", "public");
    } else {
      const { data: friends } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", currentUserId);

      const friendIds = friends?.map((f) => f.friend_id) || [];

      postQuery = postQuery.or(`visibility.eq.public, user_id.in.(${friendIds.join(",")})`);
    }

    const { data: posts, error } = await postQuery;
    if (error) throw new Error(error.message);
    return posts;
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const toggleSticky = async (postId, makeSticky) => {
  const { error } = await supabase
    .from("posts")
    .update({ sticky: makeSticky })
    .eq("id", postId);

  if (error) {
    toast.error("Failed to toggle sticky status:", error.message);
  }
};

export const addComment = async (postId, userId, text) => {
  const { data, error } = await supabase
    .from("comments")
    .insert([{ post_id: postId, user_id: userId, text }])
    .select("*, profiles(username)")
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteComment = async (commentId, userId) => {
  const { error } = await supabase.from("comments").delete().eq("id", commentId).eq("user_id", userId);
  if (error) throw new Error(error.message);
};

// ✅ Voting
export const toggleVote = async (postId, userId) => {
  const { data, error } = await supabase
    .from("post_votes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw new Error(error.message);

  if (data) {
    const { error: deleteError } = await supabase.from("post_votes").delete().eq("id", data.id);
    if (deleteError) throw new Error(deleteError.message);
  } else {
    const { error: insertError } = await supabase.from("post_votes").insert([{ post_id: postId, user_id: userId }]);
    if (insertError) throw new Error(insertError.message);
  }
};

// ✅ Admin promotion
const promoteUserToAdmin = async (targetUserId) => {
  try {
    const session = (await supabase.auth.getSession()).data.session;

    const response = await fetch("https://usvcucujzfzazszcaonb.supabase.co/functions/v1/promote-user-to-admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`, // ✅ Add CEO's token
      },
      body: JSON.stringify({ targetUserId }),
    });

    const text = await response.text();
    const result = text ? JSON.parse(text) : {};

    if (!response.ok) {
      toast.error(result.error || "Promotion failed.");
      return { success: false };
    }

    toast.success("User promoted to admin.");
    return { success: true };
  } catch (err) {
    toast.error("Unexpected error: " + err.message);
    return { success: false };
  }
};

export { promoteUserToAdmin };