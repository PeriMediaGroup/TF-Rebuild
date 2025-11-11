import { useEffect, useState } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { getFeedPosts } from "../postApi";
import { fetchRandomAd } from "../../../utils/AdFetcher";
import PostCard from "../card";
import AdSlot from "../../admin/ads/AdSlot";
import "../../../styles/posts.scss";

const PostList = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("main");
  const [ad, setAd] = useState(null);
  const filterOptions = user
    ? ["main", "friends", "trending"]
    : ["main", "trending"];
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getFeedPosts(user?.id || null, filter);
        const adToShow = await fetchRandomAd("banner");
        setPosts(data);
        setAd(adToShow);
      } catch (err) {
        console.error("Failed to load posts:", err);
        setPosts([]);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [user, filter]);

  return (
    <div className="post-list">
      <div className="post-list__filters">
        {filterOptions.map((type) => (
          <button
            key={type}
            className={`post-list__filter-btn ${
              filter === type ? "active" : ""
            }`}
            onClick={() => setFilter(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="post-list__loading">Loading posts...</div>
      ) : posts.length > 0 ? (
        posts.map((post, i) => (
          <div key={post.id}>
            <PostCard post={post} />
            {i === 2 && ad && <AdSlot ad={ad} />}
          </div>
        ))
      ) : (
        <div className="post-list__empty">No posts to show yet.</div>
      )}
    </div>
  );
};

export default PostList;
