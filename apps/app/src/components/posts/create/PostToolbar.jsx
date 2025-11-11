import "../../../styles/posttoolbar.scss";

const PostToolbar = ({
  onCameraClick,
  onVideoClick,
  onUploadClick,
  onEmojiClick,
  onGifClick,
  onPollToggle,
  isPollActive, 
  isCEO,
}) => {
  return (
    <div className="post-toolbar-wrapper">
      <div className="post-toolbar">
        <button type="button" className="no-button mobile-only" onClick={onCameraClick}>📸 Camera</button>
        {isCEO && ( <button type="button" className="no-button mobile-only" onClick={onVideoClick}>🎥 Video</button> )}
        <button type="button" className="no-button" onClick={onUploadClick}>📁 Upload</button>
        <button type="button" className="no-button" onClick={onEmojiClick}>😊 Emoji</button>
        <button type="button" className="no-button" onClick={onGifClick}>🎬 GIF</button>
        <button type="button" className={`no-button ${isPollActive ? "active" : ""}`} onClick={onPollToggle}>📊 Poll</button>
      </div>
    </div>
  );
};

export default PostToolbar;