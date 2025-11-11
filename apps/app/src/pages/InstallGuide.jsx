import React from "react";
import { InstallButton } from "../components/common";
import "../styles/installguide.scss";

const InstallGuide = () => {
  return (
    <div className="install-guide">
      <h2>📲 How to Install TriggerFeed</h2>

      <section>
        <h3>iOS (Safari)</h3>
        <ol>
          <li>Tap the <strong>Share</strong> button (🔗)</li>
          <li>Scroll down and tap <strong>“Add to Home Screen”</strong></li>
        </ol>
      </section>

      <section>
        <h3>Android (Chrome)</h3>
        <ol>
          <li>You should see an <strong>“Install”</strong> banner or icon</li>
          <li>Tap it to add TriggerFeed to your Home Screen</li>
        </ol>
        <InstallButton />
      </section>

      <section>
        <h3>Desktop</h3>
        <ol>
          <li>Look for the <strong>Install icon</strong> in the address bar (usually top-right)</li>
        </ol>
        <InstallButton />
      </section>
    </div>
  );
};

export default InstallGuide;
