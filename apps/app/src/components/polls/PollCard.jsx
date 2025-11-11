import { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import { fetchPollVotes, votePoll } from "../../utils/pollApi";

const PollCard = ({ poll }) => {
  const { user } = useAuth();
  const [votes, setVotes] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    loadVotes();
  }, []);

  const loadVotes = async () => {
    const data = await fetchPollVotes(poll.id);
    setVotes(data);

    const userVote = data.find(v => v.user_id === user?.id);
    setHasVoted(!!userVote);
  };

  const handleVote = async (index) => {
    if (hasVoted || !user) return;

    await votePoll(poll.id, user.id, index);
    await loadVotes();
  };

  const totalVotes = votes.length;
  const optionCounts = poll.options.map((_, idx) =>
    votes.filter(v => v.option_index === idx).length
  );

  return (
    <div className="poll-card">
      <span>Poll : </span>
      <span className="poll-card__question">{poll.question}</span>

      <div className="poll-card__options">
        <span>Options : </span>
        {poll.options.map((option, idx) => (
          <button
            key={idx}
            className="poll-card__option"
            onClick={() => handleVote(idx)}
            disabled={hasVoted}
          >
            {option}
            {totalVotes > 0 && (
              <span className="poll-card__percentage">
                {" "}
                ({((optionCounts[idx] / totalVotes) * 100).toFixed(0)}%)
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PollCard;

