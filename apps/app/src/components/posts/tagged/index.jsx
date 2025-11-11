
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PostCard from "../card";
import supabase from "../../../utils/supabaseClient";

const TaggedPage = () => {
  const { tag } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPostsByTag = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("hashtags")
        .select("posts(*, profiles(*), images:post_images(url))")
        .eq("tag", tag.toLowerCase());

      if (error) {
        console.error("Error fetching tagged posts:", error.message);
        setError("Failed to load posts.");
        setLoading(false);
        return;
      }

      const extractedPosts = data.map((entry) => entry.posts).filter(Boolean);
      setPosts(extractedPosts);
      setLoading(false);
    };

    fetchPostsByTag();
  }, [tag]);

  return (
    <div className="tagged-page">
      <h2 className="tagged-page__title">Posts with the # {tag}</h2>
      {loading && <p className="tagged-page__loading">Loading posts...</p>}
      {error && <p className="tagged-page__error">{error}</p>}
      {!loading && posts.length === 0 && (
        <p className="tagged-page__empty">No posts with #{tag} yet.</p>
      )}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default TaggedPage;
