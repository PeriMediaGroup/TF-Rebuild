import supabase from "./supabaseClient";

// Get a random ad (optionally filtered by type)
export const fetchRandomAd = async (type = null) => {
  const today = new Date().toISOString().split("T")[0];

  let query = supabase
    .from("ads")
    .select("*")
    .eq("active", true)
    .lte("start_date", today)
    .or(`end_date.is.null,end_date.gte.${today}`);

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch ad:", error.message);
    return null;
  }

  if (!data || data.length === 0) return null;

  // Return a random ad
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
};
