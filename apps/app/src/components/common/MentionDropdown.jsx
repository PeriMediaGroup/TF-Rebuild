import React from "react";
import "../../styles/mentiondropdown.scss";

const MentionDropdown = ({ results, onSelect, loading, style }) => {
  if (!results?.length && !loading) return null;

  return (
    <ul className="mention-dropdown" style={style}>
      {loading && <li className="mention-dropdown__loading">Searching...</li>}
      {!loading &&
        results.map((user, i) => (
          <li
            key={i}
            className="mention-dropdown__item"
            onMouseDown={(e) => e.preventDefault()} onClick={() => onSelect(user.username)} 
          >
            @{user.username}
          </li>
        ))}
    </ul>
  );
};

export default MentionDropdown;
