// components/posts/create/PostDescriptionInput.jsx
import React from "react";
import MentionDropdown from "../../common/MentionDropdown";

const PostDescriptionInput = ({
  description,
  setDescription,
  trigger,
  matches,
  loading,
  descInputRef,
  onMentionSelect,
}) => {
  return (
    <div className="mention-wrapper" style={{ position: "relative" }}>
      <textarea
        ref={descInputRef}
        placeholder="Write something..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="create-post__textarea"
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

export default PostDescriptionInput;