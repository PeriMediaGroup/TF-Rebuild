import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const signInWithEmail = async ({ email, password }) => {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { success: false, error };
  return { success: true, data };
};

export const signUpWithEmail = async ({ email, password }) => {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) return { success: false, error };
  return { success: true, data };
};

export const sendPasswordReset = async ({ email, redirectTo }) => {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) return { success: false, error };
  return { success: true, data };
};
