import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../auth/AuthContext";
import { fetchComments, deleteComment, updateComment } from "./commentApi.jsx";
import {
  fetchCommentLikes,
  getUserCommentLikes,
  toggleCommentLike,
} from "./commentLikesApi";
import AddComment from "./AddComment";
import { MentionLinkText } from "../common";
import FullscreenImageModal from "../common/FullscreenImageModal";
import { formatLocalDateTime } from "../../utils/dateHelpers";
import defaultAvatar from "/images/default-avatar.png";
import { useLocation } from "react-router-dom";
import "../../styles/comments.scss";

const CommentThread = ({ postId, onCommentAdded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentLikes, setCommentLikes] = useState({});
  const [userLikes, setUserLikes] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const editRef = useRef(null); // ⬅️ Added

  const location = useLocation();
  const isSinglePostPage = location.pathname.startsWith("/posts/");

  useEffect(() => {
    loadComments();
  }, [postId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetCommentId = params.get("commentId");

    if (!comments.length || !targetCommentId) return;

    let attempts = 0;
    const maxAttempts = 20;
    const interval = setInterval(() => {
      const el = document.getElementById(`comment-${targetCommentId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("highlight-comment");
        setTimeout(() => el.classList.remove("highlight-comment"), 2500);
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        console.warn("🚫 Could not find comment:", targetCommentId);
        clearInterval(interval);
      }
      attempts++;
    }, 150);
  }, [comments]);

  const loadComments = async () => {
    const all = await fetchComments(postId);
    setComments(all);

    const ids = all.map((c) => c.id);
    const likeCounts = await fetchCommentLikes(ids);
    setCommentLikes(likeCounts);

    if (user) {
      const liked = await getUserCommentLikes(user.id);
      setUserLikes(liked);
    }
  };

  const handleNewComment = async () => {
    await loadComments();
    onCommentAdded?.();
    setReplyTo(null);
  };

  const handleDelete = async (commentId) => {
    const success = await deleteComment(commentId, user.id);
    if (success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  const handleToggleLike = async (commentId) => {
    await toggleCommentLike(commentId, user.id);
    await loadComments();
  };

  const renderComments = (parentId = null, level = 0) => {
    return comments
      .filter((c) => c.parent_id === parentId)
      .map((comment) => {
        const isOwner = user?.id === comment.user_id;
        const isPrivileged = ["ceo", "admin"].includes(
          user?.role?.toLowerCase()
        );
        const liked = userLikes.includes(comment.id);
        const isEditing = editingCommentId === comment.id;
        return (
          <div
            key={comment.id}
            id={`comment-${comment.id}`}
            className={`comment-thread__comment comment-thread__comment--level-${level}`}
          >
            <div className="comment-thread__header">
              <img
                className="comment-thread__avatar"
                src={comment.profiles?.profile_image_url || defaultAvatar}
                alt="avatar"
              />
              <span className="comment-thread__username">
                {comment.profiles?.username || "user"}
              </span>
              <span className="comment-thread__timestamp">
                📍 {formatLocalDateTime(comment.created_at)}
              </span>
            </div>

            <div className="comment-thread__body">
              {isEditing ? (
                <div className="comment-thread__editbox">
                  <textarea
                    ref={editRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div className="comment-thread__edit-actions">
                    <button
                      onClick={async () => {
                        try {
                          await updateComment(comment.id, editText);
                          setEditingCommentId(null);
                          setEditText("");
                          editRef.current?.blur(); // ⬅️ Blur on save
                          await loadComments();
                        } catch (err) {
                          console.error("Edit failed:", err.message);
                        }
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditText("");
                        editRef.current?.blur(); // ⬅️ Blur on cancel
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <MentionLinkText text={comment.text || ""} />
              )}
              {comment.image_url && (
                <div className="comment-thread__image">
                  <img
                    src={comment.image_url}
                    alt="comment media"
                    onClick={() => setFullscreenImage(comment.image_url)}
                    style={{
                      maxWidth: "100%",
                      marginTop: "0.5rem",
                      cursor: "zoom-in",
                    }}
                  />
                </div>
              )}
            </div>

            <div className="comment-thread__actions">
              <button onClick={() => setReplyTo(comment)}>Reply</button>
              {(isOwner || isPrivileged) && (
                <>
                  <button onClick={() => handleDelete(comment.id)}>
                    Delete
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditText(comment.text);
                      }}
                      style={{ marginLeft: "0.5rem" }}
                    >
                      Edit
                    </button>
                  )}
                </>
              )}
              {user && (
                <button
                  className={`comment-thread__like-btn${liked ? " liked" : ""}`}
                  onClick={() => handleToggleLike(comment.id)}
                >
                  + {commentLikes[comment.id] || 0}
                </button>
              )}
            </div>

            {replyTo?.id === comment.id && (
              <AddComment
                postId={postId}
                parentId={comment.id}
                replyingTo={comment.profiles?.username}
                onCommentAdded={handleNewComment}
              />
            )}

            {comments.some((c) => c.parent_id === comment.id) && (
              <div className="comment-thread__replies">
                {renderComments(comment.id, level + 1)}
              </div>
            )}
          </div>
        );
      });
  };

  return (
    <div className="comment-thread">
      <div className="comment-thread__list">{renderComments()}</div>
      <AddComment postId={postId} onCommentAdded={handleNewComment} />
      <FullscreenImageModal
        imageUrl={fullscreenImage}
        onClose={() => setFullscreenImage(null)}
      />
    </div>
  );
};

export default CommentThread;
