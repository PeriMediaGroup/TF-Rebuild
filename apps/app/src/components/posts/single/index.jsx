import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPostById } from "../postApi";
import PostCard from "../card";
import CommentThread from "../../comments/CommentThread";
import SideBox from "../../common/SideBox";
import { BuyMeACoffee, BackButton } from "../../common";
import TopUsers from "../../stats/TopUsers";
import TopHashTag from "../../stats/TopHashTag";
import "../../../styles/homepage.scss";

const SinglePost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPost = async () => {
      const data = await getPostById(id);
      if (data) {
        setPost(data);
      } else {
        setError("Post not found or has been deleted.");
      }
      setLoading(false);
    };

    loadPost();
  }, [id]);

  if (loading) return <div className="post-loading">Loading...</div>;
  if (error)
    return (
      <div className="post-error">
        {error} <BackButton />
      </div>
    );

  return (
    <div className="home">
      <div className="home__left">
        <div className="single-post-page">
          <PostCard post={post} />
          <CommentThread postId={post?.id} />
        </div>
      </div>
      <aside className="home__right">
        <SideBox title="📈 Top Users">
          <TopUsers />
        </SideBox>

        <SideBox title="🔥 Trending Hashtags">
          <TopHashTag />
        </SideBox>

        <SideBox title="👉 Buy us some ammo?">
          <BuyMeACoffee />
        </SideBox>
      </aside>
    </div>
  );
};

export default SinglePost;
