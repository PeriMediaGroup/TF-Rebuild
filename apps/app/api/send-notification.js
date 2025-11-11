import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

// Setup VAPID credentials
webpush.setVapidDetails(
  "mailto:notifications@triggerfeed.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Setup Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { subscription: rawSub, userId, title, body, url = "/" } = req.body;

  let subscription = rawSub;

  // If no subscription passed in, try to look it up from Supabase
  if (!subscription && userId) {
    const { data: sub, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !sub || !sub.endpoint || !sub.p256dh || !sub.auth) {
      console.error("❌ Incomplete or missing subscription:", error || sub);
      return res.status(404).json({ error: "No valid subscription found" });
    }

    subscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };
  }

  if (!subscription?.endpoint) {
    return res.status(400).json({ error: "Missing or invalid subscription" });
  }

  const payload = JSON.stringify({ title, body, url });

  try {
    await webpush.sendNotification(subscription, payload);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("🔥 Push error:", err);
    return res.status(500).json({ error: "Failed to send push", details: err.message });
  }
}

