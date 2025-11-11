import React from "react";
import "../../styles/votebuttons.scss";

const VoteButtons = ({ upvotes, downvotes, userVote, onVote }) => {
  return (
    <div className="post-card__vote-split">
      <div className="vote-block">
        <button
          className={`vote-button vote-button--up ${userVote === 1 ? "active" : ""}`}
          onClick={() => onVote(1)}
        >
          +
        </button>
        <span className="vote-count">{upvotes}</span>
      </div>

      <div className="vote-block">
        <button
          className={`vote-button vote-button--down ${userVote === -1 ? "active" : ""}`}
          onClick={() => onVote(-1)}
        >
          −
        </button>
        <span className="vote-count">-{downvotes}</span>
      </div>
    </div>
  );
};

export default VoteButtons;
