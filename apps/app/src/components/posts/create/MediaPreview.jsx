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
  const previewClass = `media-preview__item ${
    context === "post" ? "media-preview__item--post" : ""
  }`;

  // Combine all sources — including Cloudinary URLs (strings) and local previews (objects)
  const allMedia = [
    ...(Array.isArray(mediaFiles) ? mediaFiles : []),
    ...(imageUrl ? [imageUrl] : []),
    ...(videoUrl ? [videoUrl] : []),
    ...(gifUrl ? [gifUrl] : []),
  ];

  return (
    <div className="media-preview">
      {allMedia.map((media, i) => {
        const src = typeof media === "string" ? media : media.previewUrl;
        const id = typeof media === "string" ? i : media.id;
        if (!src) return null;

        const isVideo = src.match(/\.(mp4|mov|m4v|webm)$/i);

        return (
          <div className="media-preview__wrapper" key={id}>
            {context !== "post" && (
              <button
                className="media-preview__remove"
                onClick={() => onDeleteImage(id)}
                title="Remove image"
              >
                ✖
              </button>
            )}
            {isVideo ? (
              <video controls playsInline muted loop className={previewClass}>
                <source src={src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={src}
                alt={`media-${i}`}
                onLoad={(e) => {
                  const { width, height } = e.target;
                  const orientation = height > width ? "portrait" : "landscape";
                  e.target.classList.add(`media-preview__item--${orientation}`);
                }}
                className={previewClass}
              />
            )}
          </div>
        );
      })}

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
