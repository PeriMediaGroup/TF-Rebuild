// components/posts/create/EmojiGifPicker.jsx
import React from "react";
import EmojiPicker from "emoji-picker-react";
import GiphyPicker from "../../common/GiphyPicker";

const EmojiGifPicker = ({
  showPicker,
  setShowPicker,
  showGiphy,
  setShowGiphy,
  onEmojiClick,
  onGifSelect,
}) => {
  return (
    <div className="create-post-modifiers__blocks">
      {showPicker && (
        <EmojiPicker
          onEmojiClick={onEmojiClick}
          theme="dark"
          emojiStyle="facebook"
          width="auto"
        />
      )}

      {showGiphy && (
        <div className="giphy-wrapper">
          <div className="giphy-picker-scroll">
            <GiphyPicker
              onGifSelect={(gif) => {
                onGifSelect(gif.images.original.url);
                setShowGiphy(false);
              }}
              onClose={() => setShowGiphy(false)}
            />
          </div>
          <div className="giphy-attribution">
            <a
              href="https://giphy.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Powered by GIPHY
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiGifPicker;
