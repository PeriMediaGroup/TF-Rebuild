'use client';

import { useEffect, useMemo } from "react";

import styles from "./CommentsPanel.module.css";

import CommentComposer from "@/components/comments/CommentComposer";
import CommentItem from "@/components/comments/CommentItem";
import { usePostComments } from "@/hooks/usePostComments";
import { useAuth } from "@/providers";

const CommentsSkeleton = () => (
  <div className={styles["comments-panel__skeleton"]}>
    <div className={styles["comments-panel__skeleton-line"]} style={{ width: "70%" }} />
    <div className={styles["comments-panel__skeleton-line"]} style={{ width: "55%" }} />
    <div className={styles["comments-panel__skeleton-line"]} style={{ width: "60%" }} />
  </div>
);

export default function CommentsPanel({
  postId,
  initialCommentId,
}) {
  const { user, isElevated } = useAuth();
  const { comments, loading, error, submitting, addComment, deleteComment } =
    usePostComments(postId);

  const targetIndex = useMemo(() => {
    if (!initialCommentId) return -1;
    return comments.findIndex((comment) => comment.id === initialCommentId);
  }, [comments, initialCommentId]);

  useEffect(() => {
    if (targetIndex < 0) return;
    const element = document.getElementById(`comment-${initialCommentId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [initialCommentId, targetIndex]);

  return (
    <section className={styles["comments-panel"]}>
      <header className={styles["comments-panel__header"]}>
        <span>Comments</span>
        <span>{comments.length}</span>
      </header>

      {error && (
        <div className={styles["comments-panel__error"]}>
          Failed to load comments. Please try again later.
        </div>
      )}

      {loading ? (
        <CommentsSkeleton />
      ) : comments.length === 0 ? (
        <p className={styles["comments-panel__empty"]}>
          No comments yet. Start the conversation!
        </p>
      ) : (
        <div className={styles["comments-panel__list"]}>
          {comments.map((comment, index) => {
            const canDelete =
              isElevated || (user?.id && comment.user_id === user.id);
            return (
              <CommentItem
                key={comment.id ?? index}
                comment={comment}
                canDelete={canDelete}
                onDelete={async () =>
                  deleteComment(comment.id, comment.user_id)
                }
                highlight={index === targetIndex}
              />
            );
          })}
        </div>
      )}

      <CommentComposer onSubmit={addComment} submitting={submitting} />
    </section>
  );
}
