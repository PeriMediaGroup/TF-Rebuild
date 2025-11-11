// components/posts/create/VisibilitySelector.jsx
import React from "react";

const VisibilitySelector = ({ visibility, setVisibility }) => {
  return (
    <div className="create-post__visibility">
      <label>Visibility:</label>
      <div className="create-post__visibility-options">
        <label>
          <input
            type="radio"
            name="visibility"
            value="public"
            checked={visibility === "public"}
            onChange={(e) => setVisibility(e.target.value)}
          />
          Public
        </label>
        <label>
          <input
            type="radio"
            name="visibility"
            value="friends"
            checked={visibility === "friends"}
            onChange={(e) => setVisibility(e.target.value)}
          />
          Friends Only
        </label>
      </div>
    </div>
  );
};

export default VisibilitySelector;
