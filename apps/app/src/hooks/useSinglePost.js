'use client';

import { useCallback, useEffect, useState } from "react";

import { fetchPostById } from "@/lib/posts/post";
import { useAuth } from "@/providers";

export const useSinglePost = (postId) => {
  const { supabase, isConfigured } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!isConfigured || !postId) {
      setPost(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchPostById(supabase, postId);
      setPost(data);
      setError(null);
    } catch (err) {
      console.error("[singlePost] load error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [isConfigured, postId, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    post,
    loading,
    error,
    refresh: load,
  };
};

