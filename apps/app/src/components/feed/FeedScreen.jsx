'use client';

import styles from "./FeedScreen.module.css";

import FeedPostCard from "@/components/feed/FeedPostCard";
import { useFeed } from "@/hooks/useFeed";

const FilterButton = ({ label, active, onClick }) => (
  <button
    type="button"
    className={`${styles.filterButton} ${active ? styles.filterActive : ""}`}
    onClick={onClick}
  >
    {label}
  </button>
);

const FeedSkeleton = () => (
  <div className={styles.skeletonList}>
    {[0, 1, 2].map((key) => (
      <div key={key} className={styles.skeletonCard}>
        <div className={`${styles.skeletonLine} ${styles.skeletonLineMedium}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonLineFull}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
      </div>
    ))}
  </div>
);

export default function FeedScreen() {
  const {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    filter,
    setFilter,
    availableFilters,
    loadMore,
  } = useFeed();

  return (
    <section className={styles.feed}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1>Community feed</h1>
          <p>
            Browse the latest posts from the TriggerFeed community. Filters and
            real-time updates mirror the V3 native app so web users get the same
            experience.
          </p>
        </div>

        <div className={styles.filters}>
          {availableFilters.map((value) => (
            <FilterButton
              key={value}
              label={value === "main" ? "Main" : value.charAt(0).toUpperCase() + value.slice(1)}
              active={filter === value}
              onClick={() => setFilter(value)}
            />
          ))}
        </div>
      </header>

      {error ? (
        <div className={styles.status}>
          <strong>Something went wrong loading the feed.</strong>
          <div>
            {error?.message
              ? error.message
              : "Try refreshing or switching filters while we reconnect to Supabase."}
          </div>
        </div>
      ) : loading ? (
        <FeedSkeleton />
      ) : posts.length === 0 ? (
        <div className={styles.status}>
          No posts yet. Be the first to post from the native app while we finish
          the composer on web.
        </div>
      ) : (
        <div className={styles.list}>
          {posts.map((post) => (
            <FeedPostCard key={post.id ?? Math.random()} post={post} />
          ))}
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          className={styles.loadMore}
          disabled={loadingMore}
          onClick={loadMore}
        >
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      )}
    </section>
  );
}
