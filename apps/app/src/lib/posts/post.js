export const POST_DETAIL_SELECT = `
  id,
  user_id,
  title,
  description,
  image_url,
  gif_url,
  video_url,
  visibility,
  created_at,
  sticky,
  profiles ( username, profile_image_url ),
  post_images ( id, url ),
  polls_app ( id )
`;

export const fetchPostById = async (supabase, postId) => {
  if (!supabase?.isConfigured?.() || !postId) return null;

  const { data, error } = await supabase
    .from("posts")
    .select(POST_DETAIL_SELECT)
    .eq("id", postId)
    .maybeSingle();

  if (error) {
    console.warn("[post] fetch error:", error.message);
    return null;
  }

  return data ?? null;
};

