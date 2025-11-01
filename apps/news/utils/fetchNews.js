// utils/fetchNews.js
import { supabase } from "../supabaseClient";

export async function fetchNews(limit = 20) {
  const { data, error } = await supabase
    .from("news_posts")
    .select("id, source_name, source_url, title, content, image_url, published_at, tags, category")
    .eq("approved", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
}
