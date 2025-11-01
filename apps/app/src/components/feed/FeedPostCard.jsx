'use client';
import { useMemo, useState } from "react";

import Link from "next/link";

import styles from "./FeedPostCard.module.css";

import CommentsPanel from "@/components/comments/CommentsPanel";
import { usePostInteractions } from "@/hooks/usePostInteractions";

const formatTimestamp = (isoString) => {
  if (!isoString) return "Unknown";
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return "Unknown";
  }
};

const buildBadges = (post) => {
  const badges = [];
  if (post?.trending_score != null) badges.push({ label: "Trending", type: "trending" });
  if (post?.sticky) badges.push({ label: "Pinned" });
  if (post?.visibility === "friends") badges.push({ label: "Friends only" });
  return badges;
};

const extractMedia = (post) => {
  if (!post) return null;

  if (post.video_url) {
    return {
      type: "video",
      sources: [post.video_url],
      label: null,
    };
  }

  const gallery = [];
  if (post.image_url) gallery.push(post.image_url);
  if (Array.isArray(post.post_images)) {
    post.post_images.forEach((img) => {
      if (img?.url) gallery.push(img.url);
    });
  }

  if (post.gif_url) {
    gallery.unshift(post.gif_url);
  }

  if (!gallery.length) return null;

  return {
    type: "image",
    sources: gallery,
    label: gallery.length > 1 ? `+${gallery.length - 1}` : null,
  };
};

const renderDescription = (text) => {
  if (!text) return null;
  const parts = [];
  const mentionRegex = /(@[A-Za-z0-9_]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const mention = match[0];
    parts.push(
      <a key={`${mention}-${match.index}`} href={`/profile/${mention.slice(1)}`}>
        {mention}
      </a>
    );
    lastIndex = match.index + mention.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

const getAvatarContent = (username, profileImage) => {
  if (profileImage) {
    return <img src={profileImage} alt={`${username} avatar`} />;
  }
  const initial = username?.[0]?.toUpperCase?.() ?? "T";
  return initial;
};

export default function FeedPostCard({ post }) {
  if (!post) return null;

  const username = post?.profiles?.username ?? "unknown";
  const avatarUrl = post?.profiles?.profile_image_url ?? null;
  const media = extractMedia(post);
  const badges = buildBadges(post);
  const { votes, comments, handleVote, loading: interactionsLoading } = usePostInteractions(
    post.id
  );
  const [showComments, setShowComments] = useState(false);

  const toggleComments = () => {
    setShowComments((prev) => !prev);
  };

  const commentsLabel = useMemo(() => {
    if (!comments) return "Comment";
    return comments === 1 ? "1 Comment" : `${comments} Comments`;
  }, [comments]);

  return (
    <article className={styles["feed-post-card"]}>
      <header className={styles["feed-post-card__header"]}>
        <div className={styles["feed-post-card__profile"]}>
          <div className={styles["feed-post-card__avatar"]}>
            {getAvatarContent(username, avatarUrl)}
          </div>
          <div className={styles["feed-post-card__meta"]}>
            <span className={styles["feed-post-card__username"]}>@{username}</span>
            <time
              className={styles["feed-post-card__timestamp"]}
              dateTime={post?.created_at ?? ""}
            >
              {formatTimestamp(post?.created_at)}
            </time>
          </div>
        </div>

        {badges.length > 0 && (
          <div className={styles["feed-post-card__badges"]}>
            {badges.map(({ label, type }) => (
              <span
                key={label}
                className={`${styles["feed-post-card__badge"]} ${
                  type === "trending" ? styles["feed-post-card__badge--trending"] : ""
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className={styles["feed-post-card__body"]}>
        {post?.title && <h2 className={styles["feed-post-card__title"]}>{post.title}</h2>}
        {(() => {
          const descriptionNodes = renderDescription(post?.description);
          if (!descriptionNodes) return null;
          return (
            <p className={styles["feed-post-card__excerpt"]}>{descriptionNodes}</p>
          );
        })()}

        {media && (
          <div className={styles["feed-post-card__media"]}>
            {media.type === "video" ? (
              <video src={media.sources[0]} controls playsInline />
            ) : (
              <img src={media.sources[0]} alt="" loading="lazy" />
            )}
            {media.label && (
              <span className={styles["feed-post-card__media-badge"]}>{media.label}</span>
            )}
          </div>
        )}
      </div>

      <footer className={styles["feed-post-card__footer"]}>
        <div className={styles["feed-post-card__stats"]}>
          <span className={styles["feed-post-card__stat"]}>
            👍 <span>{votes.up}</span>
          </span>
          {post.trending_score != null && (
            <span className={styles["feed-post-card__stat"]}>
              🔥 <span>{Number(post.trending_score).toFixed?.(1) ?? post.trending_score}</span>
            </span>
          )}
        </div>

        <div className={styles["feed-post-card__actions"]}>
          <button
            type="button"
            className={`${styles["feed-post-card__action"]} ${
              votes.userVote === "up" ? styles["feed-post-card__action--active"] : ""
            }`}
            onClick={() => handleVote("up")}
            disabled={interactionsLoading}
            aria-pressed={votes.userVote === "up"}
          >
            👍 Upvote
          </button>
          <button
            type="button"
            className={`${styles["feed-post-card__action"]} ${
              votes.userVote === "down" ? styles["feed-post-card__action--active"] : ""
            }`}
            onClick={() => handleVote("down")}
            disabled={interactionsLoading}
            aria-pressed={votes.userVote === "down"}
          >
            👎 Downvote
          </button>
          <button
            type="button"
            className={styles["feed-post-card__action"]}
            onClick={toggleComments}
            aria-expanded={showComments}
            aria-controls={`feed-post-card-comments-${post.id}`}
          >
            💬 {commentsLabel}
          </button>
          <Link href={`/posts/${post.id}`} className={styles["feed-post-card__action"]}>
            Open Post
          </Link>
        </div>
      </footer>

      {showComments && (
        <div
          id={`feed-post-card-comments-${post.id}`}
          className={styles["feed-post-card__comments"]}
        >
          <CommentsPanel postId={post.id} />
        </div>
      )}
    </article>
  );
}
