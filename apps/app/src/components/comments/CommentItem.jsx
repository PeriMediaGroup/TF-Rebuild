'use client';

import styles from "./CommentItem.module.css";

const formatRelative = (isoString) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / (60 * 1000));
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatTimestamp(isoString);
  } catch {
    return "";
  }
};

const renderContent = (body) => {
  if (!body) return null;
  const parts = [];
  const mentionRegex = /(@[A-Za-z0-9_]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(body)) !== null) {
    if (match.index > lastIndex) {
      parts.push(body.slice(lastIndex, match.index));
    }
    const mention = match[0];
    parts.push(
      <a key={`${mention}-${match.index}`} href={`/profile/${mention.slice(1)}`}>
        {mention}
      </a>
    );
    lastIndex = match.index + mention.length;
  }

  if (lastIndex < body.length) {
    parts.push(body.slice(lastIndex));
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

export default function CommentItem({ comment, canDelete, onDelete, highlight }) {
  if (!comment) return null;
  const username = comment?.profiles?.username ?? "unknown";
  const avatar = comment?.profiles?.profile_image_url ?? null;
  const className = `${styles["comment-item"]} ${
    highlight ? styles["comment-item--highlight"] : ""
  }`;
  const elementId = comment.id ? `comment-${comment.id}` : undefined;

  return (
    <div id={elementId} className={className}>
      <div className={styles["comment-item__avatar"]}>
        {getAvatarContent(username, avatar)}
      </div>
      <div className={styles["comment-item__body"]}>
        <div className={styles["comment-item__meta"]}>
          <span className={styles["comment-item__username"]}>@{username}</span>
          <span className={styles["comment-item__timestamp"]}>
            {formatRelative(comment.created_at)}
          </span>
        </div>
        <div className={styles["comment-item__content"]}>
          {renderContent(comment.body)}
        </div>
        {canDelete && (
          <div className={styles["comment-item__actions"]}>
            <button
              type="button"
              className={styles["comment-item__button"]}
              onClick={() => onDelete?.(comment)}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
