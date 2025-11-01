// supabase/functions/publish-news/index.ts
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />
// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET")!;
console.log("publish-news env check:", CRON_SECRET);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  // --- Simple header-based authentication ---
  const authHeader = req.headers.get("x-cron-secret");
  console.log("🔍 DEBUG:", { authHeader, CRON_SECRET });
  if (authHeader !== CRON_SECRET) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        received: authHeader,
        expected: CRON_SECRET,
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    console.log("Starting publish-news job...");

    // --- Only promote news from the last 24 hours ---
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: queue, error: fetchError } = await supabase
      .from("news_queue")
      .select("*")
      .gt("published_at", since)
      .order("published_at", { ascending: false });

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
      });
    }

    let inserted = 0;
    for (const item of queue || []) {
      // avoid duplicates
      const { data: exists } = await supabase
        .from("news_posts")
        .select("id")
        .eq("hash", item.hash)
        .maybeSingle();

      if (exists) continue;

      const { error: insertError } = await supabase.from("news_posts").insert([
        {
          source_name: item.source_name,
          source_url: item.source_url,
          title: item.title_raw,
          content_raw: item.content_raw,
          image_url: item.image_url,
          published_at: item.published_at,
          hash: item.hash,
        },
      ]);

      if (!insertError) inserted++;
      else console.error("Insert error:", insertError.message);
    }

    console.log(`✅ Published ${inserted} new posts.`);
    return new Response(JSON.stringify({ status: "success", inserted }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Publish error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
