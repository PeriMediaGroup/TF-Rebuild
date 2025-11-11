import React, { useEffect } from "react";
import { logAdImpression, logAdClick } from "./adApi";
import { useAuth } from "../../../auth/AuthContext";

import "../../../styles/ads.scss";

const AdSlot = ({ ad }) => {
  const { user } = useAuth();
  const isMobile = window.innerWidth < 768;
  const imageUrl =
    isMobile && ad.mobile_image_url ? ad.mobile_image_url : ad.image_url;
  const displayType = isMobile && ad.mobile_image_url ? "mobile" : ad.type;

  const adClass = `ad ad--${displayType}`;

  useEffect(() => {
    // Fire impression once on mount
    if (ad?.id) {
      logAdImpression({
        adId: ad.id,
        userId: user?.id,
        // Let server capture IP/UA if you're proxying through edge functions
      });
    }
  }, [ad?.id, user?.id]);

  const handleClick = async (e) => {
    e.preventDefault();
    if (ad?.id) {
      await logAdClick({ adId: ad.id, userId: user?.id });
    }
    window.open(ad.destination_url, "_blank", "noopener,noreferrer");
  };

  if (!ad?.active) return null;

  return (
    <div className={adClass}>
      <a
        href={ad.destination_url || "#"}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={imageUrl}
          alt={ad.title}
          loading="lazy"
          className="ad__image"
        />
      </a>
    </div>
  );
};

export default AdSlot;
