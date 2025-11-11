import React from "react";
import toast from "react-hot-toast";
import "../../styles/mediasource.scss";

const MediaSourcePicker = ({ onImageSelect, allowMultiple = false }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please upload an image smaller than 5MB.");
      return;
    }

    onImageSelect(file);
  };

  return (
    <div className="media-source-picker">
      <button htmlFor="camera-upload" className="media-source-picker--mobile-only no-button">
        📸 Camera
      </button>
      <input
        id="camera-upload"
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <button htmlFor="file-upload" className="no-button">
        📁 Upload
      </button>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        multiple={allowMultiple}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default MediaSourcePicker;
