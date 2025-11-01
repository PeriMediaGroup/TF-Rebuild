'use client';

import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchFriendIds } from "@/lib/friends/fetchFriendIds";
import { fetchFeedPage, subscribeToFeed } from "@/lib/feed/feedService";
import { useAuth } from "@/providers";

const PAGE_SIZE = 10;

const mergeUnique = (current, incoming) => {
  if (!Array.isArray(incoming) || !incoming.length) return current;
  if (!Array.isArray(current) || !current.length) return incoming;

  const existing = new Map(current.map((post) => [post.id, post]));
  const next = [...current];

  incoming.forEach((post) => {
    if (post?.id == null) {
      next.push(post);
      return;
    }
    if (!existing.has(post.id)) {
      existing.set(post.id, post);
      next.push(post);
    } else {
      const index = next.findIndex((item) => item.id === post.id);
      if (index >= 0) {
        next[index] = post;
      }
    }
  });

  return next;
};

export const useFeed = () => {
  const { supabase, user, isConfigured } = useAuth();
  const [filter, setFilter] = useState("main");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState(null);
  const [friendIds, setFriendIds] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);

  const canUseFriendsFilter = Boolean(user?.id);

  useEffect(() => {
    if (!canUseFriendsFilter && filter === "friends") {
      setFilter("main");
    }
  }, [canUseFriendsFilter, filter]);

  useEffect(() => {
    if (!isConfigured || !user?.id) {
      setFriendIds([]);
      return;
    }

    let cancelled = false;
    setFriendsLoading(true);

    fetchFriendIds(supabase, user.id)
      .then((ids) => {
        if (!cancelled) setFriendIds(ids);
      })
      .finally(() => {
        if (!cancelled) setFriendsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isConfigured, supabase, user?.id]);

  const loadPage = useCallback(
    async (pageIndex) => {
      if (!isConfigured) return [];
      try {
        const data = await fetchFeedPage({
          supabase,
          filter,
          userId: user?.id ?? null,
          friendIds,
          page: pageIndex,
          pageSize: PAGE_SIZE,
        });
        setError(null);
        return data;
      } catch (err) {
        console.error("[feed] loadPage error:", err);
        setError(err);
        return [];
      }
    },
    [filter, friendIds, isConfigured, supabase, user?.id]
  );

  const refresh = useCallback(async () => {
    if (!isConfigured) return;
    if (filter === "friends" && canUseFriendsFilter && friendsLoading) {
      return;
    }
    setLoading(true);
    const data = await loadPage(0);
    setPosts(data);
    setHasMore(data.length === PAGE_SIZE);
    setPage(1);
    setLoading(false);
  }, [
    canUseFriendsFilter,
    filter,
    friendsLoading,
    isConfigured,
    loadPage,
  ]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !isConfigured) return;
    setLoadingMore(true);
    const data = await loadPage(page);
    setPosts((prev) => mergeUnique(prev, data));
    setHasMore(data.length === PAGE_SIZE);
    setPage((prev) => prev + 1);
    setLoadingMore(false);
  }, [hasMore, isConfigured, loadPage, loadingMore, page]);

  useEffect(() => {
    if (!isConfigured) return undefined;
    const unsubscribe = subscribeToFeed(supabase, () => {
      refresh();
    });
    return unsubscribe;
  }, [isConfigured, refresh, supabase]);

  const availableFilters = useMemo(() => {
    if (canUseFriendsFilter) return ["main", "friends", "trending"];
    return ["main", "trending"];
  }, [canUseFriendsFilter]);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    filter,
    setFilter,
    availableFilters,
    refresh,
    loadMore,
    isConfigured,
  };
};

