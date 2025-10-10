"use client";

import "./about.scss";
import { useState } from "react";
import Modal from "../../components/Modal";

export default function About() {
  const [showRules, setShowRules] = useState(false);

  return (
    <section class="tf-about">
      <div class="tf-about__section tf-about__intro">
        <h1 class="tf-about__title">About TriggerFeed</h1>
        <p class="tf-about__tagline"><strong>Post without the safety on.</strong></p>
        <p>
          TriggerFeed was born out of frustration — shooters, collectors, and builders were watching their voices get buried on mainstream social platforms.
          We decided to build something better: a place where firearms culture could breathe again.
        </p>
      </div>

      <div class="tf-about__section tf-about__mission">
        <h2 class="tf-about__heading">Our Mission</h2>
        <p>
          To connect gun owners, builders, and enthusiasts without censorship or bias.
          TriggerFeed gives the 2A community a voice and a home — where you can post, share, and discuss responsibly while celebrating craftsmanship, sport, and freedom.
        </p>
      </div>

      <div class="tf-about__section tf-about__values">
        <h2 class="tf-about__heading">What We Stand For</h2>
        <ul class="tf-about__list">
          <li><strong>Respect.</strong> Every responsible gun owner deserves a space built on mutual respect.</li>
          <li><strong>Community.</strong> We’re here to connect, not divide — whether you’re a collector, hunter, competitor, or builder.</li>
          <li><strong>Transparency.</strong> No hidden agendas. No arbitrary bans. Just a clear set of <button
            className="tf-link"
            onClick={() => setShowRules(true)}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-crimson)",
              cursor: "pointer",
              padding: 0,
              font: "inherit",
            }}
          >
            community rules
          </button>{" "}
            {showRules && (
              <Modal title="Community Rules" onClose={() => setShowRules(false)}>
                <ul>
                  <li>No illegal content or promotion of unlawful activity.</li>
                  <li>No harassment, doxxing, or hate speech.</li>
                  <li>Respect others — debate ideas, not people.</li>
                  <li>Posts depicting or glorifying violence will be removed.</li>
                  <li>Keep all content within lawful firearm ownership and use.</li>
                </ul>
              </Modal>
            )} that protect both speech and safety.</li>
          <li><strong>Responsibility.</strong> TriggerFeed enforces zero tolerance for illegal content or exploitation. We support education, safety, and lawful ownership.</li>
        </ul>
      </div>

      <div class="tf-about__section tf-about__story">
        <h2 class="tf-about__heading">How It Started</h2>
        <p>
          TriggerFeed was created by developers, shooters, and industry friends who were tired of seeing good people lose their accounts for doing nothing wrong.
          We took years of social-tech experience and mixed it with a lifetime of range time to build a network we’d actually want to use.
        </p>
      </div>

      <div class="tf-about__section tf-about__future">
        <h2 class="tf-about__heading">What’s Next</h2>
        <p>
          We’re constantly evolving — adding features, improving privacy, expanding notifications, and opening the door for creators,
          small businesses, and manufacturers to connect directly with their audience.
        </p>
        <p class="tf-about__cta">
          Join us, help shape the community, and make your mark on the feed.<br /><br />
          <a href="https://app.triggerfeed.com" className="tf-btn tf-btn--primary">Launch the App →</a>
        </p>
      </div>
    </section>

  );
}
