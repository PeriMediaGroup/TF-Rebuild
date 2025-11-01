'use client';

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  logOut: async () => {},
  isConfigured: false,
  supabase: null,
});

export const AuthProvider = ({ children }) => {
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const initialize = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (cancelled) return;
        if (error) {
          console.warn("[Auth] session load error:", error.message);
          setUser(null);
        } else if (data?.session?.user) {
          setUser(data.session.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[Auth] session init failed:", err);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initialize();

    const { data: authListener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      }) || {};

    return () => {
      cancelled = true;
      authListener?.subscription?.unsubscribe?.();
    };
  }, [configured, supabase]);

  useEffect(() => {
    if (!configured || !user?.id) {
      setProfile(null);
      return;
    }

    let active = true;

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "id, username, email, role, rank, city, state, dob, joined_at, about, profile_image_url, banner_url, privacy_settings, badges, is_muted, is_banned, top_friends, top_guns"
          )
          .eq("id", user.id)
          .eq("is_deleted", false)
          .maybeSingle();

        if (!active) return;

        if (error) {
          console.warn("[Auth] profile fetch error:", error.message);
          setProfile(null);
          return;
        }

        if (data) {
          setProfile(data);
          return;
        }

        const fallbackUsername = (() => {
          if (!user.email) return `user-${String(user.id).slice(0, 6)}`;
          const base = user.email.split("@")[0];
          return `${base}-${String(user.id).slice(0, 6)}`;
        })();

        const { data: upserted, error: upsertError } = await supabase
          .from("profiles")
          .upsert(
            [
              {
                id: user.id,
                email: user.email,
                username: fallbackUsername,
                joined_at: new Date().toISOString(),
              },
            ],
            { onConflict: "id" }
          )
          .select(
            "id, username, email, role, rank, city, state, dob, joined_at, about, profile_image_url, banner_url, privacy_settings, badges, is_muted, is_banned, top_friends, top_guns"
          )
          .maybeSingle();

        if (!active) return;

        if (upsertError) {
          console.warn("[Auth] profile upsert error:", upsertError.message);
          setProfile(null);
          return;
        }

        setProfile(upserted ?? null);
      } catch (err) {
        if (!active) return;
        console.error("[Auth] profile load failed:", err);
        setProfile(null);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [configured, supabase, user?.email, user?.id]);

  const logOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error("[Auth] sign out failed:", err);
    }
  };

  const isElevated =
    !!profile?.role &&
    ["admin", "ceo"].includes(String(profile.role).toLowerCase());

  const value = useMemo(
    () => ({
      user,
      profile,
      isElevated,
      loading,
      isConfigured: configured,
      logOut,
      supabase,
    }),
    [configured, isElevated, loading, logOut, profile, supabase, user]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
