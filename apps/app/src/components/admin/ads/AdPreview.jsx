import PropTypes from "prop-types";

const AdPreview = ({ image_url, mobile_image_url, title, type }) => {
  if (!image_url && !mobile_image_url) return null;

  return (
    <div className={`ad-preview ad-preview--${type}`}>
      <div className="ad-preview__group">
        {image_url && (
          <div className="ad-preview__block">
            <p className="ad-preview__label">Desktop Version</p>
            <img src={image_url} alt={`${title} - desktop`} className="ad-preview__image" />
          </div>
        )}
        {mobile_image_url && (
          <div className="ad-preview__block">
            <p className="ad-preview__label">Mobile Version</p>
            <img src={mobile_image_url} alt={`${title} - mobile`} className="ad-preview__image" />
          </div>
        )}
      </div>
      <div className="ad-preview__meta">
        <p className="ad-preview__title">{title}</p>
        <span className="ad-preview__type">{type}</span>
      </div>
    </div>
  );
};

AdPreview.propTypes = {
  image_url: PropTypes.string,
  mobile_image_url: PropTypes.string,
  title: PropTypes.string,
  type: PropTypes.string,
};

export default AdPreview;
