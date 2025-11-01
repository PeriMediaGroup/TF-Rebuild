const POST_SELECT = `
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

const rangeTuple = (page, pageSize) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
};

const applyRange = (query, from, to) =>
  query.range ? query.range(from, to) : query;

const fetchMainPosts = async (supabase, { from, to }) => {
  const { data, error } = await applyRange(
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("visibility", "public")
      .order("sticky", { ascending: false })
      .order("created_at", { ascending: false }),
    from,
    to
  );
  if (error) throw error;
  return data ?? [];
};

const fetchFriendPosts = async (supabase, userId, friendIds, { from, to }) => {
  if (!userId) return [];

  const set = new Set(friendIds || []);
  set.add(userId);
  const friendList = Array.from(set);
  if (!friendList.length) return [];

  const { data, error } = await applyRange(
    supabase
      .from("posts")
      .select(POST_SELECT)
      .in("user_id", friendList)
      .eq("visibility", "friends")
      .order("sticky", { ascending: false })
      .order("created_at", { ascending: false }),
    from,
    to
  );
  if (error) throw error;
  return data ?? [];
};

const fetchTrendingPosts = async (supabase, userId, friendIds, { from, to }) => {
  let trendingQuery = supabase
    .from("post_trending_view")
    .select("id, user_id, visibility, score")
    .order("score", { ascending: false })
    .order("created_at", { ascending: false });

  if (userId && friendIds?.length) {
    const set = new Set(friendIds);
    set.add(userId);
    const joined = Array.from(set).join(",");
    trendingQuery = trendingQuery.or(
      `visibility.eq.public,and(user_id.in.(${joined}),visibility.eq.friends)`
    );
  } else {
    trendingQuery = trendingQuery.eq("visibility", "public");
  }

  const { data: trendingRows, error: trendingError } = await applyRange(
    trendingQuery,
    from,
    to
  );
  if (trendingError) throw trendingError;
  if (!trendingRows?.length) return [];

  const ids = trendingRows.map((row) => row.id);
  const { data: postsData, error: postsError } = supabase
    .from("posts")
    .select(POST_SELECT)
    .in("id", ids);

  if (postsError) throw postsError;

  const orderMap = new Map(ids.map((id, index) => [id, index]));
  const scoreMap = new Map(trendingRows.map((row) => [row.id, row.score ?? null]));

  return (postsData || [])
    .filter((post) => orderMap.has(post.id))
    .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
    .map((post) => ({
      ...post,
      trending_score: scoreMap.get(post.id) ?? null,
    }));
};

export const fetchFeedPage = async ({
  supabase,
  filter = "main",
  userId = null,
  friendIds = [],
  page = 0,
  pageSize = 10,
}) => {
  if (!supabase?.isConfigured?.()) return [];

  const { from, to } = rangeTuple(page, pageSize);

  if (filter === "friends") {
    return fetchFriendPosts(supabase, userId, friendIds, { from, to });
  }

  if (filter === "trending") {
    return fetchTrendingPosts(supabase, userId, friendIds, { from, to });
  }

  return fetchMainPosts(supabase, { from, to });
};

export const subscribeToFeed = (supabase, handler) => {
  if (!supabase?.isConfigured?.()) {
    return () => {};
  }

  const channel = supabase
    .channel("posts-feed-web")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "posts" },
      handler
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
