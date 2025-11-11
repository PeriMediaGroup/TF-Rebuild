import { useState, useEffect } from "react";
import supabase from "../utils/supabaseClient";

const useMentionAutocomplete = (text) => {
  const [trigger, setTrigger] = useState(null); // { index, query }
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const match = /@([a-zA-Z0-9._-]*)$/.exec(text.slice(0, getCaretIndex()));
    if (match) {
      setTrigger({ query: match[1], index: match.index });
    } else {
      setTrigger(null);
      setResults([]);
    }
  }, [text]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!trigger?.query || trigger.query.length < 1) {
        setResults([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .ilike("username", `${trigger.query}%`)
        .limit(5);
      setLoading(false);

      if (error) {
        console.error("mention autocomplete error:", error.message);
      } else {
        setResults(data || []);
      }
    };

    fetchResults();
  }, [trigger]);

  return {
    trigger,
    results,
    loading,
  };
};

function getCaretIndex() {
  const el = document.activeElement;
  if (!el || typeof el.selectionStart !== "number") return 0;
  return el.selectionStart;
}

export default useMentionAutocomplete;