// components/posts/create/PollBuilder.jsx
import React from "react";

const PollBuilder = ({ pollQuestion, setPollQuestion, pollOptions, setPollOptions }) => {
  const updateOption = (idx, value) => {
    const updated = [...pollOptions];
    updated[idx] = value;
    setPollOptions(updated);
  };

  const addOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  return (
    <div className="create-post__poll">
      <input
        type="text"
        placeholder="Poll Question"
        value={pollQuestion}
        onChange={(e) => setPollQuestion(e.target.value)}
        className="create-post__input"
        required
      />

      {pollOptions.map((opt, idx) => (
        <input
          key={idx}
          type="text"
          placeholder={`Option ${idx + 1}`}
          value={opt}
          onChange={(e) => updateOption(idx, e.target.value)}
          className="create-post__input"
          required
        />
      ))}

      <button type="button" onClick={addOption} className="create-post__add-option">
        + Add Option
      </button>
    </div>
  );
};

export default PollBuilder;