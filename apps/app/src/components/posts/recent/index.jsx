
import { Link } from "react-router-dom";
import { formatLocalDateTime } from "../../utils/dateHelpers";

const RecentPosts = ({ posts }) => {
  return (
    <div className="profile-view__posts">
      <h3>Recent Posts</h3>
      {posts.length === 0 ? (
        <p className="none">No posts yet.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <Link to={`/post/${post.id}`}>
                {post.title} — {formatLocalDateTime(post.created_at)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentPosts;
