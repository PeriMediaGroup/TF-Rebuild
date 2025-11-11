import { useEffect, useState } from "react";
import { fetchPollVotes } from "../../utils/pollApi";

const PollResults = ({ poll }) => {
  const [votes, setVotes] = useState([]);

  useEffect(() => {
    const loadVotes = async () => {
      const data = await fetchPollVotes(poll.id);
      setVotes(data);
    };
    loadVotes();
  }, [poll.id]);

  const voteCounts = poll.options.map((_, index) => 
    votes.filter(v => v.option_index === index).length
  );
  const totalVotes = votes.length;

  return (
    <div className="poll-results">
      <h3>{poll.question}</h3>
      <ul>
        {poll.options.map((opt, idx) => (
          <li key={idx}>
            {opt}: {voteCounts[idx]} votes ({totalVotes > 0 ? ((voteCounts[idx] / totalVotes) * 100).toFixed(1) : 0}%)
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PollResults;
