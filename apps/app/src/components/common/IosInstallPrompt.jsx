import { useEffect, useState } from "react";
import "../../styles/iosinstall.scss";

const IosInstallPrompt = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isInStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (isIos && !isInStandalone) {
      const alreadyDismissed = localStorage.getItem("iosInstallDismissed");
      if (!alreadyDismissed) setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="ios-install">
      <div className="ios-install__content">
        <p>📱 Install TriggerFeed on your iPhone:</p>
        <p>
          Tap <strong>Share</strong> <span className="ios-install__icon">🔗</span> then
          <strong> "Add to Home Screen"</strong>
        </p>
        <button onClick={() => {
          localStorage.setItem("iosInstallDismissed", "true");
          setShow(false);
        }}>
          Got it
        </button>
      </div>
    </div>
  );
};

export default IosInstallPrompt;
