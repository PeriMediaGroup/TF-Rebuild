'use client';

import { useCallback, useEffect, useState } from "react";

import { fetchCommentCount } from "@/lib/posts/comments";
import { fetchVoteState, toggleVote } from "@/lib/posts/votes";
import { useAuth } from "@/providers";

export const usePostInteractions = (postId) => {
  const { supabase, user, isConfigured } = useAuth();
  const [votes, setVotes] = useState({ up: 0, down: 0, userVote: null });
  const [comments, setComments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = user?.id ?? null;

  const refresh = useCallback(async () => {
    if (!isConfigured || !postId) {
      setVotes({ up: 0, down: 0, userVote: null });
      setComments(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [voteState, commentTotal] = await Promise.all([
        fetchVoteState(supabase, postId, userId),
        fetchCommentCount(supabase, postId),
      ]);
      setVotes(voteState);
      setComments(commentTotal);
      setError(null);
    } catch (err) {
      console.error("[postInteractions] refresh error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [isConfigured, postId, supabase, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isConfigured || !postId) return undefined;
    const channel = supabase
      .channel(`post-interactions-${postId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${postId}` },
        () => refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_votes", filter: `post_id=eq.${postId}` },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isConfigured, postId, refresh, supabase]);

  const handleVote = useCallback(
    async (type) => {
      if (!isConfigured) return { success: false };
      if (!userId) {
        window.alert?.("Log in to vote on posts.");
        return { success: false, error: "not-authenticated" };
      }

      const optimistic = { ...votes };
      if (votes.userVote === type) {
        if (type === "up") optimistic.up = Math.max(0, optimistic.up - 1);
        if (type === "down") optimistic.down = Math.max(0, optimistic.down - 1);
        optimistic.userVote = null;
      } else {
        if (type === "up") {
          optimistic.up += 1;
          if (votes.userVote === "down") optimistic.down = Math.max(0, optimistic.down - 1);
        } else {
          optimistic.down += 1;
          if (votes.userVote === "up") optimistic.up = Math.max(0, optimistic.up - 1);
        }
        optimistic.userVote = type;
      }
      setVotes(optimistic);

      const result = await toggleVote(supabase, { postId, userId, type });
      if (!result.success) {
        await refresh();
      } else {
        const latest = await fetchVoteState(supabase, postId, userId);
        setVotes(latest);
      }
      return result;
    },
    [isConfigured, postId, supabase, userId, votes, refresh]
  );

  return {
    votes,
    comments,
    loading,
    error,
    refresh,
    handleVote,
  };
};
