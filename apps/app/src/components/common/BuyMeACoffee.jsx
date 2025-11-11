import React from "react";
import "../../styles/buymeacoffee.scss";

const Support = () => {
  return (
    <div className="support">
      <img
        src="images/bmc_qr.png"
        alt="Buy Me a Coffee QR"
        className="support__qr"
      /><br/>
      <p>Like what we're building?</p>
      <a
        href="https://www.buymeacoffee.com/triggerfeed"
        target="_blank"
        rel="noopener noreferrer"
        className="support__link"
      >Help keep the feed running strong.</a>
      <br />
    </div>
  );
};

export default Support;
