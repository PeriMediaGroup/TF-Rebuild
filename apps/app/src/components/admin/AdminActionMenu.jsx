import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../auth/AuthContext";
import supabase from "../../utils/supabaseClient";
import "../../styles/admins.scss";

const AdminActionMenu = ({ post }) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin" || profile?.role === "ceo";
  const [showPanel, setShowPanel] = useState(false);

  if (!isAdmin) return null;

  const updatePost = async (postId, changes) => {
    const { error } = await supabase
      .from("posts")
      .update(changes)
      .eq("id", postId);
    if (error) toast.error("Error updating post: " + error.message);
  };

  const handleToggleSticky = async () => {
    await updatePost(post.id, { sticky: !post.sticky });
    toast.success(post.sticky ? "Post unpinned." : "Post pinned.");
    window.location.reload();
  };

  const handleToggleCommentsLocked = async () => {
    await updatePost(post.id, { comments_locked: !post.comments_locked });
    toast.success(
      post.comments_locked ? "Comments unlocked." : "Comments locked."
    );
    window.location.reload();
  };

  const handleToggleFlag = async () => {
    const newFlagStatus = !post.flagged;

    const { error } = await supabase
      .from("posts")
      .update({ flagged: newFlagStatus })
      .eq("id", post.id);

    if (error) {
      toast.error("Failed to flag post: " + error.message);
    } else {
      toast.success(newFlagStatus ? "Post flagged." : "Flag removed.");
      window.location.reload();
    }
  };

  const handleDeletePost = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmDelete) return;

    // Step 1: delete the post
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id);

    if (deleteError) {
      toast.error("Failed to delete post: " + deleteError.message);
      return;
    }

    // Step 2: send notification to the original author
    const { error: notifyError } = await supabase.from("notifications").insert([
      {
        user_id: post.user_id,
        type: "moderation",
        data: {
          reason: "Your post was removed by an admin.",
          post_title: post.title,
          post_description: post.description,
          deleted_at: new Date().toISOString(),
        },
        is_read: false,
      },
    ]);

    if (notifyError) {
      console.error("Notification insert error:", notifyError.message);
    }

    toast.success("Post deleted and user notified.");
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <div className="admin-action">
      <button
        className="admin-action__toggle"
        onClick={() => setShowPanel((prev) => !prev)}
      >
        {" "}
        ⚙️{" "}
      </button>

      {showPanel && (
        <div className="admin-action__panel">
          <h4 className="admin-action__title">Moderation Panel</h4>

          <button className="admin-action__button" onClick={handleToggleFlag}>
            {post.flagged ? "🚩 Unflag Post" : "🚩 Flag Post"}
          </button>

          <button className="admin-action__button" onClick={handleDeletePost}>
            🗑️ Delete Post
          </button>

          <button
            className="admin-action__button"
            onClick={handleToggleCommentsLocked}
          >
            {post.comments_locked ? "Unlock Comments" : "Lock Comments"}
          </button>

          <button className="admin-action__button" onClick={handleToggleSticky}>
            {post.sticky ? "Unpin Post" : "Pin Post"}
          </button>

          <div className="admin-action__disabled">
            🚫 Shadowban User{" "}
            <span className="admin-action__badge">Coming Soon</span>
          </div>

          <div className="admin-action__disabled">
            🚷 Ban User{" "}
            <span className="admin-action__badge">In the Works</span>
          </div>

          <div className="admin-action__disabled">
            🌎 Change Post Visibility{" "}
            <span className="admin-action__badge">Coming Soon</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActionMenu;
