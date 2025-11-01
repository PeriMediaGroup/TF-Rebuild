const readEnv = () => ({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null,
});

const initial = readEnv();

export const SUPABASE_URL = initial.supabaseUrl;
export const SUPABASE_ANON_KEY = initial.supabaseAnonKey;

export const getRuntimeConfig = () => ({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null,
});

export const isRuntimeSupabaseConfigured = () => {
  const { supabaseUrl, supabaseAnonKey } = getRuntimeConfig();
  return Boolean(supabaseUrl && supabaseAnonKey);
};

