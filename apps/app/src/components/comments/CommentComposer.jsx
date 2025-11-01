'use client';

import { useMemo, useState } from "react";

import styles from "./CommentComposer.module.css";

import { useAuth } from "@/providers";

const getAvatarContent = (username, profileImage) => {
  if (profileImage) {
    return <img src={profileImage} alt={`${username} avatar`} />;
  }
  const initial = username?.[0]?.toUpperCase?.() ?? "T";
  return initial;
};

export default function CommentComposer({ onSubmit, submitting }) {
  const { user, profile } = useAuth();
  const [value, setValue] = useState("");

  const disabled = useMemo(() => submitting || !value.trim(), [submitting, value]);

  if (!user) {
    return (
      <p className={styles["comment-composer__message"]}>
        You need to log in to leave a comment.
      </p>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (disabled) return;
    const result = await onSubmit?.(value);
    if (result?.success) {
      setValue("");
    }
  };

  return (
    <form className={styles["comment-composer"]} onSubmit={handleSubmit}>
      <div className={styles["comment-composer__avatar"]}>
        {getAvatarContent(profile?.username ?? user.email ?? "user", profile?.profile_image_url)}
      </div>
      <div className={styles["comment-composer__form"]}>
        <textarea
          className={styles["comment-composer__textarea"]}
          placeholder="Write a comment..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <div className={styles["comment-composer__actions"]}>
          <button
            type="submit"
            className={styles["comment-composer__button"]}
            disabled={disabled}
          >
            {submitting ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </form>
  );
}
