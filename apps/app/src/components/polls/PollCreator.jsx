import { useState } from "react";
import { createPoll } from "../../utils/pollApi";
import { useAuth } from "../../auth/AuthContext";

const PollCreator = () => {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [success, setSuccess] = useState(false);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (options.some(opt => opt.trim() === "")) return;

    const newPoll = await createPoll(question, options, user.id);

    if (newPoll) {
      setSuccess(true);
      setQuestion("");
      setOptions(["", ""]);
    }
  };

  return (
    <div className="poll-creator">
      <h2>Create a Poll</h2>
      {success && <p>✅ Poll created!</p>}
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Poll question..." 
          value={question} 
          onChange={(e) => setQuestion(e.target.value)} 
          required 
        />
        {options.map((opt, idx) => (
          <input 
            key={idx} 
            type="text" 
            placeholder={`Option ${idx + 1}`} 
            value={opt} 
            onChange={(e) => handleOptionChange(idx, e.target.value)} 
            required 
          />
        ))}
        <button type="button" onClick={handleAddOption}>+ Add Option</button>
        <button type="submit">Create Poll</button>
      </form>
    </div>
  );
};

export default PollCreator;

