import React from "react";
import { InstallButton, BuyMeACoffee } from "../components/common";

const About = () => {
  return (
    <div className="home">
      <div className="home__left">
        <h2>About TriggerFeed</h2>
        <p>
          TriggerFeed is a social platform built for the 2A
          community — creators, collectors, enthusiasts, and defenders of the
          Constitution.
        </p>
        <p>
          We got tired of censorship, shadowbans, and account nukes just for
          talking about our passions — so we are building our own place.
          TriggerFeed is a firearm-friendly space where you can post freely,
          connect with like-minded users, and grow a real community without fear
          of getting silenced.
        </p>

        <p>What are we up to?</p>
        <ul>
          <li>Development, development &amp; development.</li>
          <li>Text, images &amp; someday video?</li>
          <li>Bug fixes &amp; cold beers.</li>
        </ul>
        <p>Let’s build something they can’t take down.</p>
      </div>

      <aside className="home__right">
        <div>
          <h3>💥 Why Support?</h3>
          <p>
            TriggerFeed is independently owned and operated — and
            we’re keeping it that way.
          </p>
          <BuyMeACoffee />
          <p>
            ☕ Buy us some ammo (not just a coffee) Every donation — big or
            small — helps fuel this mission, you’re keeping free expression
            alive for the 2A world.
          </p>
          <InstallButton />
        </div>
      </aside>
    </div>
  );
};

export default About;
