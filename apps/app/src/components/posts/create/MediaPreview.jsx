import React from "react";

const extractYoutubeId = (url) => {
  const patterns = [
    /youtube\.com\/watch\?v=([\w-]+)/,
    /youtube\.com\/shorts\/([\w-]+)/,
    /youtu\.be\/([\w-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const MediaPreview = ({
  mediaFiles = [],
  gifUrl = null,
  imageUrl = null,
  videoUrl = null,
  description = "",
  onDeleteImage = () => {},
  context = "create",
}) => {
  const urls = description.match(/https?:\/\/[^\s]+/g) || [];
  const youtubeId = urls.map(extractYoutubeId).find(Boolean);
  const previewClass = `media-preview__item ${context === "post" ? "media-preview__item--post" : ""}`;

  return (
    <div className="media-preview">
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Post"
          onLoad={(e) => {
            const { width, height } = e.target;
            const orientation = height > width ? "portrait" : "landscape";
            e.target.classList.add(`media-preview__item--${orientation}`);
          }}
          className={previewClass}
        />
      )}

      {videoUrl && (
        <div className="media-preview__wrapper">
          <video controls className={previewClass}>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {gifUrl && (
        <img
          src={gifUrl}
          alt="GIF preview"
          onLoad={(e) => {
            const { width, height } = e.target;
            const orientation = height > width ? "portrait" : "landscape";
            e.target.classList.add(`media-preview__item--${orientation}`);
          }}
          className={previewClass}
        />
      )}

      {mediaFiles.map((media, i) => (
        <div className="media-preview__wrapper" key={media.id}>
          <button
            className="media-preview__remove"
            onClick={() => onDeleteImage(media.id)}
            title="Remove image"
          >
            ✖
          </button>
          <img
            src={media.previewUrl}
            alt={`preview-${i}`}
            className={`media-preview__item ${context === "post" ? "media-preview__item--post" : ""}`}
          />
        </div>
      ))}
      {youtubeId && (
        <div className="media-preview__youtube">
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube preview"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default MediaPreview;
