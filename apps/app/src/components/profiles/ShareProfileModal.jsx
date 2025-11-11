import { toast } from "react-hot-toast";

const ShareProfileModal = ({ username, isSelf, onClose }) => {
  const profileUrl = isSelf
    ? `https://triggerfeed.com/user/${username}`
    : window.location.href;

  return (
    <div className="modal share-profile">
      <h3>📢 Share Your Profile</h3>
      <input value={profileUrl} readOnly />
      <button
        onClick={() => {
          navigator.clipboard.writeText(profileUrl);
          toast.success("Profile link copied to clipboard!");
        }}
      >
        Copy
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default ShareProfileModal;
