import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { deletePost, updatePost } from "../postApi";
import { toggleVote, getUserVote } from "../voteApi";
import { useAuth } from "../../../auth/AuthContext";
import {
  VoteButtons,
  MentionLinkText,
  FullscreenImageModal,
} from "../../common";
import PollCard from "../../polls/PollCard";
import { fetchPoll } from "../../../utils/pollApi";
import supabase from "../../../utils/supabaseClient";
import { formatLocalDateTime } from "../../../utils/dateHelpers.js";
import CommentThread from "../../comments/CommentThread";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import defaultAvatar from "/images/default-avatar.png";
import MediaPreview from "../create/MediaPreview";
import { stripYoutubeLinks } from "../../../utils/stripYoutubeLinks";
import AdminActionMenu from "../../admin/AdminActionMenu";

const PostCard = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [showModeration, setShowModeration] = useState(false);
  const { user, profile } = useAuth();
  const [userVote, setUserVote] = useState(null);
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [pollData, setPollData] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const isOwner = user?.id === post.user_id;
  const isPrivileged = ["ceo", "admin"].includes(profile?.role?.toLowerCase());
  const hasYoutubeLink = (text) =>
    /https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/i.test(text);
  const fetchCommentCount = async () => {
    const { count, error } = await supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("post_id", post.id);

    if (!error) {
      setCommentCount(count);
    }
  };

  useEffect(() => {
    const loadPoll = async () => {
      try {
        if (post.poll_id) {
          const poll = await fetchPoll(post.poll_id);
          setPollData(poll);
        } else {
        }
      } catch (err) {
        console.error("Error loading poll:", err.message);
      }
    };

    const loadVotes = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("post_votes")
        .select("user_id, value")
        .eq("post_id", post.id);

      if (!error && data) {
        const ups = data.filter((v) => v.value === 1).length;
        const downs = data.filter((v) => v.value === -1).length;
        const myVote = data.find((v) => v.user_id === user.id);

        setUpvotes(ups);
        setDownvotes(downs);
        setUserVote(myVote?.value ?? null);
      }
    };

    loadPoll();
    loadVotes();
    fetchCommentCount();
  }, [post.id, user, post.poll_id]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmDelete) return;

    const success = await deletePost(post.id);

    if (success) {
      toast.success("Post deleted.");
      setTimeout(() => window.location.reload(), 1500); // allow toast to show
    } else {
      toast.error("Failed to delete post.");
    }
  };

  const handleVote = async (val) => {
    if (!user) {
      toast.error("You must be logged in to vote.");
      return;
    }
    const result = await toggleVote(post.id, user.id, val);

    const { data } = await supabase
      .from("post_votes")
      .select("user_id, value")
      .eq("post_id", post.id);

    const ups = data.filter((v) => v.value === 1).length;
    const downs = data.filter((v) => v.value === -1).length;
    setUpvotes(ups);
    setDownvotes(downs);
    setUserVote(result);
  };

  return (
    <div className="post-card">
      <div className="post-card__img-holder">
        <div className="post-card__title-block">
          {post.title && (
            <h3 className="post-card__title">
              <MentionLinkText text={post?.title || ""} />
            </h3>
          )}

          {post.flagged && (
            <span className="post-card__tag post-card__tag--flagged">
              🚩 by Admin
            </span>
          )}
          <AdminActionMenu post={post} />
        </div>

        {/* Unified media preview */}
        {(post.images?.length > 0 ||
          post.image_url ||
          post.video_url ||
          post.gif_url ||
          hasYoutubeLink(post.description)) && (
          <MediaPreview
            // Prefer new Cloudinary-linked images first
            mediaFiles={
              post.images?.length
                ? post.images.map((img) => img.url)
                : post.video_url
                  ? [post.video_url]
                  : post.image_url
                    ? [post.image_url]
                    : []
            }
            gifUrl={post.gif_url}
            description={post.description}
            context="post"
          />
        )}

        {post.description && (
          <div className="post-card__description">
            <MentionLinkText text={stripYoutubeLinks(post.description || "")} />
          </div>
        )}

        <div className="post-card__user">
          <div className="post-card__user-avatar">
            <img
              src={post.profiles?.profile_image_url || defaultAvatar}
              alt="avatar"
              className="post-card__avatar"
              loading="lazy"
            />
          </div>

          <div className="post-card__user-details">
            <div className="post-card__user-name">
              {post.profiles?.username ? (
                <Link
                  to={`/user/${post.profiles.username}`}
                  className="post-card__author"
                >
                  @{post.profiles.username}
                </Link>
              ) : (
                <span className="post-card__author">@??Oops??</span>
              )}
              <p className="post-card__timestamp">
                📍{formatLocalDateTime(post.created_at)}
              </p>
              {post.visibility === "friends" && (
                <span className="post-card__tag post-card__tag--friends">
                  Friends Only
                </span>
              )}
            </div>
          </div>

          <VoteButtons
            upvotes={upvotes}
            downvotes={downvotes}
            userVote={userVote}
            onVote={handleVote}
          />
        </div>
        <div className="post-card__actions">
          {isOwner && (
            <>
              <Link to={`/edit/${post.id}`} className="post-card__link">
                Edit Post
              </Link>
              <span className="post-card__divider">|</span>
              <a onClick={handleDelete} className="post-card__link">
                Delete Post
              </a>
            </>
          )}
          <button
            className="post-card__toggle-comments"
            onClick={() => setShowComments(!showComments)}
          >
            {showComments ? "Hide Comments" : `Comments (${commentCount})`}
          </button>
        </div>
      </div>

      {pollData && <PollCard poll={pollData} />}

      {showComments && (
        <CommentThread
          postId={post.id}
          onCommentAdded={() => fetchCommentCount()}
        />
      )}

      <FullscreenImageModal
        imageUrl={fullscreenImage}
        onClose={() => setFullscreenImage(null)}
      />
    </div>
  );
};

export default PostCard;
