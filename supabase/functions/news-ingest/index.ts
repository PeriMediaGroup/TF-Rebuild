export const config = { auth: false };
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

async function sha256(message: string) {
  const data = new TextEncoder().encode(message);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  // CORS / preflight
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];
    let inserted = 0;

    for (const item of items) {
      const { source_name, source_url, title, content, published_at } = item;
      if (!source_name || !source_url || !title) continue;

      const hash = await sha256(`${title}-${content || ""}`);

      const { data: existing } = await supabase
        .from("news_queue")
        .select("id")
        .eq("hash", hash)
        .maybeSingle();

      if (existing) continue;

      const { error } = await supabase.from("news_queue").insert([{
        source_name,
        source_url,
        title_raw: title,
        content_raw: content,
        published_at,
        hash
      }]);

      if (!error) inserted++;
      else console.error("Insert error:", error.message);
    }

    return new Response(JSON.stringify({ status: "queued", inserted }), {
      headers: { "Content-Type": "application/json", ...corsHeaders }, status: 200
    });
  } catch (err: any) {
    console.error("Ingest error:", err?.message || err);
    return new Response(JSON.stringify({ error: err?.message || "unknown" }), {
      headers: { "Content-Type": "application/json", ...corsHeaders }, status: 500
    });
  }
});
