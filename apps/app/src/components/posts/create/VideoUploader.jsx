import { useRef, forwardRef, useImperativeHandle, useState } from "react";
import toast from "react-hot-toast";

const MAX_VIDEO_SIZE_MB = 100;

const VideoUploader = forwardRef(
  ({ videoFile, setVideoFile, videoPreview, setVideoPreview }, ref) => {
    const videoInputRef = useRef(null);
    const [videoMeta, setVideoMeta] = useState(null);

    useImperativeHandle(ref, () => ({
      openFileDialog: () => {
        console.log("Opening file dialog...");
        videoInputRef.current?.click();
      },
    }));

    const handleVideoSelect = (file) => {
      if (!file) return;

      const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Unsupported video format.");
        return;
      }

      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > MAX_VIDEO_SIZE_MB) {
        toast.error(
          `Video must be under ${MAX_VIDEO_SIZE_MB}MB. This one is ${fileSizeMB.toFixed(1)}MB.`
        );
        return;
      }

      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        const width = video.videoWidth;
        const height = video.videoHeight;

        const orientation = height > width ? "portrait" : "landscape";

        if (duration > 90) {
          toast.error("Video must be 90 seconds or less.");
          return;
        }

        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
        setVideoMeta({
          duration: duration.toFixed(1),
          size: fileSizeMB.toFixed(1),
          orientation,
        });
        setVideoOrientation(orientation);
      };

      video.src = URL.createObjectURL(file);
    };

    return (
      <>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={(e) => handleVideoSelect(e.target.files[0])}
        />

        {videoPreview && (
          <div className="media-preview__wrapper">
            <button
              className="media-preview__remove"
              onClick={() => {
                setVideoFile(null);
                setVideoPreview(null);
                setVideoMeta(null);
              }}
              title="Remove video"
            >
              ✖
            </button>
            <video controls className="media-preview__item">
              <source src={videoPreview} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {videoMeta && (
              <p className="video-preview__meta">
                ⏱ {videoMeta.duration}s   💾 {videoMeta.size}MB   📋{" "}
                {videoMeta.orientation}
              </p>
            )}
          </div>
        )}
      </>
    );
  }
);

export default VideoUploader;
