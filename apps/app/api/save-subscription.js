import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ This must be server-side only!
);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // or whitelist localhost
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") return res.status(405).end();

  const { user_id, subscription } = req.body;

  if (!user_id || !subscription) {
    return res.status(400).json({ error: "Missing user_id or subscription" });
  }

  const { endpoint, keys } = subscription;

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Subscription save error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
