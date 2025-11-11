import supabase from "../../utils/supabaseClient";
import { fetchUserFriends } from "../friends/friendsApi";

export const POST_SELECT_FIELDS = `
  id,
  user_id,
  flagged,
  title,
  description,
  image_url,
  video_url,
  gif_url,
  visibility,
  created_at,
  sticky,
  poll_id,
  profiles (
    username,
    profile_image_url
  ),
  images:post_images (
    url
  )
`;

// postApi.js
export const createPostWithImages = async ({
  userId,
  title,
  description,
  mediaFiles,
  videoUrl,
  gifUrl,
  visibility,
  sticky = false,
  pollId,
  sharedWith,
}) => {
  const { data: postData, error: postError } = await supabase
    .from("posts")
    .insert([{ user_id: userId, title, description, gif_url: gifUrl, video_url: videoUrl, visibility, sticky, poll_id: pollId, shared_with: sharedWith }])
    .select()
    .single();

  if (postError) return { success: false, error: postError.message };

  const postId = postData.id;
  const uploadedUrls = [];

  for (const media of mediaFiles) {
    const file = media.file;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "triggerfeed_unsigned"); // ← Your unsigned preset name

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/triggerfeed/image/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (result.secure_url) {
        uploadedUrls.push(result.secure_url);
      } else {
        console.warn("Cloudinary upload failed:", result);
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
    }
  }

  // Insert image URLs into post_images
  const insertImages = uploadedUrls.map((url) => ({
    post_id: postId,
    url,
  }));

  if (insertImages.length > 0) {
    const { error: imageError } = await supabase.from("post_images").insert(insertImages);
    if (imageError) {
      console.error("Image insert error:", imageError.message);
    }
  }

  return { success: true, postId };
};


export const createPost = async ({ profile_image_url, userId, title, description, gif_url: gifUrl, imageFile, gif_url,
  visibility }) => {
  try {
    let imageUrl = null;
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, imageFile, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);
      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("posts").insert([
      { profile_image_url, user_id: userId, title, description, image_url: imageUrl, gif_url: gifUrl, visibility }
    ]);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllPosts = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT_FIELDS)
    .order("sticky", { ascending: false }) // 🔥 Sticky first
    .order("created_at", { ascending: false }); // 🕒 Newest next

  if (error) {
    console.error("Error fetching posts:", error.message);
    return [];
  }

  return data;
};

export const getPostById = async (id) => {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT_FIELDS)
    .eq("id", id)
    .single();

  return error ? null : data;
};

export const getPostsByTag = async (tag) => {
  const { data, error } = await supabase
    .from("hashtags")
    .select("posts(*)")
    .eq("tag", tag.toLowerCase());

  if (error) {
    console.error("Error fetching posts by tag:", error.message);
    return [];
  }

  return data.map((entry) => entry.posts).filter(Boolean);
};

export const updatePost = async (id, updates) => {
  const { error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", id);

  return !error;
};

export const deletePost = async (id) => {
  const { error, data } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .select(); // fetch the deleted row to confirm
  console.log("🧩 Attempting to delete post ID:", id);

  if (error) {
    console.error("❌ deletePost failed:", error.message);
    return false;
  }

  console.log("🗑️ Deleted post:", data);
  return true;
};

export const getFeedPosts = async (userId, filter = "main") => {
  try {
    let query;

    // 🔥 Trending: public only if not logged in, else public + friends
    if (filter === "trending") {
      let trendingQuery = supabase
        .from("post_trending_view")
        .select("id, user_id, visibility, score")
        .order("score", { ascending: false })
        .order("created_at", { ascending: false });

      if (userId) {
        const friends = await fetchUserFriends(userId);
        const friendIds = friends.map((f) => f.id);
        friendIds.push(userId);

        const orFilter = [
          "visibility.eq.public",
          `and(user_id.in.(${friendIds.join(",")}),visibility.eq.friends)`
        ].join(",");

        trendingQuery = trendingQuery.or(orFilter);
      } else {
        trendingQuery = trendingQuery.eq("visibility", "public");
      }

      const { data: trendingRows, error: trendingError } = await trendingQuery;
      if (trendingError) throw trendingError;
      if (!trendingRows?.length) return [];

      const ids = trendingRows.map((row) => row.id);
      const orderMap = new Map(ids.map((id, index) => [id, index]));

      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select(POST_SELECT_FIELDS)
        .in("id", ids);

      if (postsError) throw postsError;

      const scoreMap = new Map(trendingRows.map((row) => [row.id, row.score]));

      const sorted = (posts || []).sort(
        (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
      );

      return sorted.map((post) => ({
        ...post,
        trending_score: scoreMap.get(post.id) ?? null,
      }));
    }

    // 👥 Friends: show friends' posts marked as 'friends'
    if (filter === "friends") {
      if (!userId) return [];

      const friends = await fetchUserFriends(userId);
      const friendIds = friends.map((f) => f.id);
      friendIds.push(userId);

      const { data, error } = await supabase
        .from("posts")
        .select(POST_SELECT_FIELDS)
        .in("user_id", friendIds)
        .eq("visibility", "friends")
        .order("sticky", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    }

    // Main feed: public posts only
    const mainQuery = supabase
      .from("posts")
      .select(POST_SELECT_FIELDS)
      .order("sticky", { ascending: false })
      .order("created_at", { ascending: false })
      .eq("visibility", "public");

    query = mainQuery;

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching feed posts:", error.message);
    return [];
  }
};
