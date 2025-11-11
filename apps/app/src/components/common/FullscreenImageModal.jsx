import React from "react";
import "../../styles/fullscreenmodal.scss"; // You can rename this if needed

const FullscreenImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="fullscreen-modal" onClick={onClose}>
      <div className="fullscreen-modal__content" onClick={(e) => e.stopPropagation()}>
        <button className="fullscreen-modal__close" onClick={onClose}>×</button>
        <img src={imageUrl} alt="fullscreen view" className="fullscreen-modal__image" />
      </div>
    </div>
  );
};

export default FullscreenImageModal;