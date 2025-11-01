'use client';

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  addComment,
  deleteComment as removeComment,
  fetchComments,
  subscribeToComments,
} from "@/lib/posts/comments";
import { parseMentions } from "@/utils/parseMentions";
import { useAuth } from "@/providers";

export const usePostComments = (postId) => {
  const { supabase, user, isConfigured, isElevated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!isConfigured || !postId) {
      setComments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchComments(supabase, postId);
      setComments(data);
      setError(null);
    } catch (err) {
      console.error("[comments] load error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [isConfigured, postId, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isConfigured || !postId) return undefined;
    const unsubscribe = subscribeToComments(supabase, postId, () => {
      load();
    });
    return unsubscribe;
  }, [isConfigured, load, postId, supabase]);

  const handleAddComment = useCallback(
    async (text) => {
      if (!isConfigured || !postId || !user?.id || !text?.trim()) return { success: false };

      setSubmitting(true);
      try {
        const mentions = parseMentions(text);
        const result = await addComment(supabase, {
          postId,
          userId: user.id,
          text,
        });
        if (!result.success) {
          return result;
        }
        // TODO: mention notifications can be reintroduced later.
        await load();
        return { success: true, mentions, commentId: result.id };
      } finally {
        setSubmitting(false);
      }
    },
    [isConfigured, load, postId, supabase, user?.id]
  );

  const handleDeleteComment = useCallback(
    async (commentId, ownerId) => {
      if (!isConfigured || !commentId) return { success: false };
      if (!isElevated && ownerId !== user?.id) {
        return { success: false, error: "not-authorized" };
      }
      const result = await removeComment(supabase, {
        commentId,
        userId: user?.id,
        isElevated,
      });
      if (result.success) {
        await load();
      }
      return result;
    },
    [isConfigured, isElevated, load, supabase, user?.id]
  );

  const grouped = useMemo(
    () =>
      comments.map((comment) => ({
        ...comment,
        body: comment.body ?? comment.text ?? comment.content ?? "",
      })),
    [comments]
  );

  return {
    comments: grouped,
    loading,
    error,
    submitting,
    addComment: handleAddComment,
    deleteComment: handleDeleteComment,
  };
};
