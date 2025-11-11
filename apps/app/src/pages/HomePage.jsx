import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import PostList from "../components/posts/list/";
import SideBox from "../components/common/SideBox";
import { BuyMeACoffee } from "../components/common";
import TopUsers from "../components/stats/TopUsers";
import TopHashTag from "../components/stats/TopHashTag";

import "../styles/homepage.scss";

const Homepage = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="home">
      <div className="home__left">
        <PostList />
        <button
          className="create-post__fab"
          onClick={() => navigate("/create-post")}
        >
          +
        </button>
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

export default Homepage;
