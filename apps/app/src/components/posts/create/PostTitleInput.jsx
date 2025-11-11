// components/posts/create/PostTitleInput.jsx
import React from "react";
import MentionDropdown from "../../common/MentionDropdown";

const PostTitleInput = ({
  title,
  setTitle,
  trigger,
  matches,
  loading,
  titleInputRef,
  onMentionSelect,
}) => {
  return (
    <div className="mention-wrapper" style={{ position: "relative" }}>
      <input
        ref={titleInputRef}
        type="text"
        name="title"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="create-post__input"
      />
      {trigger && (
        <MentionDropdown
          results={matches}
          loading={loading}
          onSelect={(username) => onMentionSelect(username)}
          style={{ position: "absolute", top: "100%", left: 0, zIndex: 99 }}
        />
      )}
    </div>
  );
};

export default PostTitleInput;