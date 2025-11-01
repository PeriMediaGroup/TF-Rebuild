import { createClient } from "@supabase/supabase-js";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  getRuntimeConfig,
  isRuntimeSupabaseConfigured,
} from "@/lib/config/runtimeConfig";
import { createSupabaseStub } from "./stub";

let cachedClient = null;

const buildClient = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }
    return createSupabaseStub();
  }

  try {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        storageKey: "tf-web-session",
      },
    });
    client.isConfigured = () => true;
    return client;
  } catch (err) {
    console.error("[supabase] createClient failed:", err);
    return createSupabaseStub("Supabase client creation failed");
  }
};

export const getSupabaseBrowserClient = () => {
  if (cachedClient) return cachedClient;
  cachedClient = buildClient();
  return cachedClient;
};

export const isSupabaseConfigured = () => isRuntimeSupabaseConfigured();

export const readCurrentSupabaseConfig = () => getRuntimeConfig();

