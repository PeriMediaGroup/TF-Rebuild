'use client';

import Link from "next/link";

import styles from "./SinglePostView.module.css";

import CommentsPanel from "@/components/comments/CommentsPanel";
import FeedPostCard from "@/components/feed/FeedPostCard";
import { useSinglePost } from "@/hooks/useSinglePost";

const SinglePostSkeleton = () => (
  <div className={styles.skeleton}>
    <div className={styles.skeletonBlock} style={{ height: 260 }} />
    <div className={styles.skeletonBlock} />
  </div>
);

export default function SinglePostView({ postId, initialCommentId }) {
  const { post, loading, error } = useSinglePost(postId);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.back}>
          ← Back to feed
        </Link>
      </div>

      {error && (
        <div className={styles.error}>
          Failed to load post. Please check the link or try again later.
        </div>
      )}

      {loading ? (
        <SinglePostSkeleton />
      ) : !post ? (
        <div className={styles.error}>Post not found.</div>
      ) : (
        <>
          <FeedPostCard post={post} />
          <CommentsPanel
            postId={post.id}
            initialCommentId={initialCommentId}
          />
        </>
      )}
    </div>
  );
}

