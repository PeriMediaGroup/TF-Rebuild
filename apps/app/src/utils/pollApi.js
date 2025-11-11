import supabase from "./supabaseClient";

// Create a new poll
export const createPoll = async (question, options, userId, visibility = 'public') => {
  const { data, error } = await supabase
    .from('polls')
    .insert([{ 
      question, 
      options, 
      created_by: userId, 
      visibility 
    }])
    .select()
    .single();
  
  if (error) {
    console.error("Poll creation error:", error.message);
    return null;
  }

  return data;
};

// Fetch a single poll by ID
export const fetchPoll = async (pollId) => {
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", pollId)
    .single();

  if (error) {
    console.error("Error fetching poll:", error.message);
    return null;
  }

  return data;
};

// Vote on a poll
export const votePoll = async (pollId, userId, optionIndex) => {
  const { data, error } = await supabase
    .from('poll_votes')
    .insert([{ 
      poll_id: pollId, 
      user_id: userId, 
      option_index: optionIndex 
    }])
    .select()
    .single();

  if (error) {
    console.error("Voting error:", error.message);
    return null;
  }

  return data;
};

// Fetch all polls (optionally filter by visibility later)
export const fetchPolls = async () => {
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Fetching polls error:", error.message);
    return [];
  }

  return data;
};

// Fetch votes for a poll
export const fetchPollVotes = async (pollId) => {
  const { data, error } = await supabase
    .from('poll_votes')
    .select('option_index')
    .eq('poll_id', pollId);

  if (error) {
    console.error("Fetching poll votes error:", error.message);
    return [];
  }

  return data;
};

export const updatePoll = async (pollId, updates) => {
  const { error } = await supabase
    .from('polls')
    .update(updates)
    .eq('id', pollId);

  if (error) {
    console.error("Poll update error:", error.message);
    return false;
  }

  return true;
};
