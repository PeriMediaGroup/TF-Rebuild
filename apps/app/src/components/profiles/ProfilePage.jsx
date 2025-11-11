import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { toast } from "react-hot-toast";
import {
  getFriendCount,
  getProfile,
  getProfileByUsername,
  getUserPostCount,
} from "./profileApi";
import { getRankFromPostCount } from "./profileApi";
import { formatLocalDateTime } from "../../utils/dateHelpers";
import supabase from "../../utils/supabaseClient";
import FriendActions from "../friends/FriendsActions";
import FriendsPanel from "../friends/FriendsPanel";
import StartMessageButton from "../messages/StartMessageButton";
import { useSearchParams } from "react-router-dom";
import EditProfile from "./EditProfile";
import ShareProfileModal from "./ShareProfileModal";
import "../../styles/profile.scss";

const ProfilePage = () => {
  const { user, profile: viewerProfile } = useAuth();
  const { username } = useParams();
  const location = useLocation();
  const [profile, setProfile] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rank, setRank] = useState("");
  const [searchParams] = useSearchParams();
  const isEditing = searchParams.get("edit") === "true";
  const [friendCount, setFriendCount] = useState(0);
  const isViewingSelf = !!user?.id && !!profile?.id && user.id === profile.id;
  const isAdmin = ["admin", "ceo"].includes(viewerProfile?.role?.toLowerCase());
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      let data = null;

      if (username) {
        const decodedUsername = decodeURIComponent(username);
        data = await getProfileByUsername(decodedUsername);
      } else if (user?.id) {
        data = await getProfile(user.id);
      }

      if (data) {
        setProfile(data);
        const postCount = await getUserPostCount(data.id);
        setRank(getRankFromPostCount(postCount));
        const count = await getFriendCount(data.id);
        setFriendCount(count);

        const { data: posts, error: postsError } = await supabase
          .from("posts")
          .select("id, title, description, created_at, image_url")
          .eq("user_id", data.id)
          .order("created_at", { ascending: false });

        if (!postsError) setUserPosts(posts);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [username, user?.id, location]);

  if (loading) return <p>Loading...</p>;
  if (!profile?.id) return <p>Profile not found.</p>;
  if (isEditing) return <EditProfile />;

  return (
    <div className="profile-view">
      {profile.banner_url && (
        <div className="profile-view__banner">
          <img
            src={profile.banner_url}
            alt="Banner"
            className="profile-view__banner-img"
          />
        </div>
      )}
      <div className="profile-view__icon">
        <img
          src={profile.profile_image_url}
          alt="Profile"
          className="profile-view__avatar"
          loading="lazy"
        />
        <div className="profile-info">
          <div className="profile-info__name">
            <label className="profile-view__title">@{profile.username}</label>

            <button
              onClick={() => setShowShareModal(true)}
              className="profile-view__share-btn"
            >
              📢 Share My Profile
            </button>
          </div>

          {showShareModal && (
            <>
              <div
                className="modal-overlay"
                onClick={() => setShowShareModal(false)}
              />
              <ShareProfileModal
                username={profile.username}
                isSelf={isViewingSelf}
                onClose={() => setShowShareModal(false)}
              />
            </>
          )}
          {!isViewingSelf && (
            <StartMessageButton
              targetUserId={profile.id}
              username={profile.username}
            />
          )}
          {(isViewingSelf || (isAdmin && user?.id !== profile.id)) && (
            <div className="profile__role-badge">
              {profile.role?.trim().toLowerCase() === "ceo" && "🦅 CEO"}
              {profile.role?.trim().toLowerCase() === "admin" && "🛡️ Admin"}
              {profile.role?.trim().toLowerCase() === "member" && "🔰 Member"}
            </div>
          )}
          <p>
            Name : {profile.first_name || <span className="none">No name</span>}{" "}
            {profile.last_name || <span className="none">&nbsp;</span>}
          </p>
          <p>
            {rank ? <>Rank: {rank}</> : <span className="none">No rank</span>}
          </p>
          <p>
            {profile.city && profile.state ? (
              <>
                {profile.city}, {profile.state}
              </>
            ) : (
              <span className="none">No location</span>
            )}
          </p>
        </div>
        <div className="profile-view__stats">
          <span>
            📅 Joined:{" "}
            {profile.joined_at
              ? formatLocalDateTime(profile.joined_at)
              : "unknown"}
          </span>
          <span>📸 {userPosts.length} Posts</span>
          <span>🤝 {friendCount} Friends</span>
        </div>
      </div>

      <div className="profile-view__about">
        {profile.about ? (
          <>
            <span>About me? </span>
            <p>{profile.about}</p>
          </>
        ) : (
          <p className="none">No about info</p>
        )}
      </div>

      {userPosts.length > 0 ? (
        <div className="profile-view__featured">
          <h3>📅 Latest Post</h3>

          <div className="profile-view__post-card">
            {userPosts[0].image_url && (
              <img
                src={userPosts[0].image_url}
                alt="Latest post"
                className="profile-view__featured-img"
              />
            )}
            <div className="profile-view__post-meta">
              <h4>{userPosts[0].title || "Untitled Post"}</h4>
              <p>
                {userPosts[0].description?.trim() ? (
                  userPosts[0].description
                ) : (
                  <span className="none">No description provided.</span>
                )}
              </p>
              <small>
                Posted on: {formatLocalDateTime(userPosts[0].created_at)}
              </small>{" "}
              &nbsp; &nbsp;
              <Link
                to={`/posts/${userPosts[0].id}`}
                className="profile-view__post-link"
              >
                🔗 View Full Post
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="profile-view__featured">
          <h3>📅 Latest Post</h3>
          <p className="none">No posts yet.</p>
        </div>
      )}

      {isViewingSelf ? (
        <>
          <button
            className="profile-view__edit-btn"
            onClick={() => (window.location.href = "/profile?edit=true")}
          >
            Edit Profile
          </button>
          <br />
          <FriendsPanel />
        </>
      ) : (
        <FriendActions targetUserId={profile.id} />
      )}
    </div>
  );
};

export default ProfilePage;
