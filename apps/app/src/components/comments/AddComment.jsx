import { useState, useRef } from "react";
import { useAuth } from "../../auth/AuthContext";
import { addComment } from "./commentApi";
import { parseMentions } from "../../utils/parseMentions";
import { pushMention } from "../../utils/push";
import supabase from "../../utils/supabaseClient";
import { createNotification } from "../notifications/notificationApi";
import useMentionAutocomplete from "../../hooks/useMentionAutocomplete";
import MentionDropdown from "../common/MentionDropdown";
import { MediaSourcePicker } from "../common";
import "../../styles/comments.scss";
import EmojiPicker from "emoji-picker-react";

const AddComment = ({
  postId,
  parentId = null,
  postOwnerId,
  commenterUsername,
  replyingTo = null,
  onCommentAdded,
}) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef();
  const { results, trigger, loading } = useMentionAutocomplete(text);
  const [showPicker, setShowPicker] = useState(false);

  const handleEmojiClick = (emojiObject) => {
    const emoji = emojiObject.emoji;
    const el = textareaRef.current;

    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newText = text.slice(0, start) + emoji + text.slice(end);

    setText(newText);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  if (!user) {
    return (
      <div className="add-comment__login-warning">
        <p>
          You must be logged in to comment. <a href="/login">Log in</a>
        </p>
        <a href="/login" className="login-link">
          Log in
        </a>
      </div>
    );
  }

  const uploadImage = async () => {
    if (!imageFile) return null;
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `comment-${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `comment-images/${fileName}`;
    const { error } = await supabase.storage
      .from("comment-images")
      .upload(filePath, imageFile);
    if (error) {
      console.error("Image upload failed:", error.message);
      return null;
    }
    const { data } = supabase.storage
      .from("comment-images")
      .getPublicUrl(filePath);
    return data?.publicUrl || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;

    setSubmitting(true);
    const imageUrl = await uploadImage();

    const newComment = await addComment({
      postId,
      userId: user.id,
      text,
      imageUrl,
      parentId,
      postOwnerId,
      commenterUsername: user.username || user.email?.split("@")[0] || "user",
    });

    if (newComment && onCommentAdded) {
      onCommentAdded(newComment);
      setText("");
      setImageFile(null);
    }

    if (postOwnerId && postOwnerId !== user.id) {
      await createNotification({
        user_id: postOwnerId,
        type: "comment",
        data: {
          post_id: postId,
          from_user_id: user.id,
          from_username: user.username || user.email?.split("@")[0] || "user",
          text,
        },
      });
    }

    const extractHashtags = (text) => {
      const matches = text.match(/#(\w+)/g);
      return matches ? matches.map((tag) => tag.slice(1).toLowerCase()) : [];
    };

    const hashtags = extractHashtags(text);

    if (hashtags.length > 0) {
      await supabase.from("hashtags").insert(
        hashtags.map((tag) => ({
          tag,
          comment_id: newComment.id,
          post_id: postId,
        }))
      );
    }

    const mentions = parseMentions(text);
    if (mentions.length > 0) {
      const mentionMatches = await Promise.all(
        mentions.map(async (mention) => {
          const { data } = await supabase
            .from("profiles")
            .select("id, username")
            .ilike("username", mention);
          return data?.[0];
        })
      );

      const mentionedUsers = mentionMatches.filter(Boolean);
      for (const u of mentionedUsers) {
        await createNotification({
          user_id: u.id,
          type: "mention",
          data: {
            post_id: postId,
            from_user_id: user.id,
            from_username: user.username || user.email?.split("@")[0] || "user",
            comment: text,
          },
        });

        await pushMention({
          toUserId: u.id,
          fromUsername: user.username || user.email?.split("@")[0] || "user",
          postId,
          commentId: newComment.id,
        });
      }
    }

    setSubmitting(false);
  };

  return (
    <form className="add-comment" onSubmit={handleSubmit}>
      {replyingTo && (
        <div className="add-comment__replying-to">
          Replying to <strong>@{replyingTo}</strong>
        </div>
      )}
      <div className="mention-wrapper" style={{ position: "relative" }}>
        {imageFile && (
          <div className="add-comment__image-preview">
            <img
              src={URL.createObjectURL(imageFile)}
              alt="preview"
              style={{ maxWidth: "25%", marginTop: "0.5rem" }}
            />
          </div>
        )}
        <textarea
          ref={textareaRef}
          className="form-field__input"
          placeholder="Write your comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={replyingTo ? 2 : 3}
        />
        {trigger && (
          <MentionDropdown
            results={results}
            loading={loading}
            onSelect={(username) => {
              const el = textareaRef.current;
              if (!el || typeof el.setSelectionRange !== "function") return;
              const cursor = el.selectionStart;
              const before = text.slice(0, cursor);
              const after = text.slice(cursor);
              const atIndex = before.lastIndexOf("@");
              if (atIndex === -1) return;
              const updatedText = `${before.slice(0, atIndex)}@${username} ${after}`;
              setText(updatedText);
              setTimeout(() => {
                el.focus();
                el.setSelectionRange(
                  atIndex + username.length + 2,
                  atIndex + username.length + 2
                );
              }, 0);
            }}
            style={{ position: "absolute", top: "100%", left: 0, zIndex: 99 }}
          />
        )}
      </div>
      <div className="add-comment__modifier">
        <button type="button" onClick={() => setShowPicker(!showPicker)}>
          😊 Emoji?
        </button>
        <MediaSourcePicker onImageSelect={(file) => setImageFile(file)} />
      </div>
      {showPicker && (
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          theme="dark"
          emojiStyle="facebook"
          width="auto"
        />
      )}
      <button type="submit" disabled={submitting}>
        {submitting ? "Posting..." : parentId ? "Reply" : "Comment"}
      </button>
    </form>
  );
};

export default AddComment;
