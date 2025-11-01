// src/components/NewsFeed.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function NewsFeed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    supabase
      .from("news_posts")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (!error) setPosts(data);
      });
  }, []);

  return (
    <div className="news-feed">
      {posts.map((p) => (
        <article key={p.hash} className="news-item">
          <h2><a href={p.source_url} target="_blank">{p.title}</a></h2>
          <p>{p.content}</p>
          <small>{p.source_name} • {new Date(p.published_at).toLocaleDateString()}</small>
        </article>
      ))}
    </div>
  );
}
