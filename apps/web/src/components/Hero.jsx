import "./hero.scss";

export default function Hero() {
  return (
    <section className="tf-hero">
      <div className="tf-hero__inner">
        <h1 className="tf-hero__title"><span className="tf-hero__title--first-word">Post</span>without the safety on.</h1>
        <p className="tf-hero__subtitle">
          The social platform built for firearms enthusiasts. Share, connect, and engage with the 2A community.
        </p>

        <div className="tf-hero__actions">
          <a
            href="https://play.google.com/store/apps/details?id=com.perimediagroup.triggerfeed"
            className="tf-btn tf-btn--primary"
          >
            Get it on Google Play
          </a>
          <a href="/install" className="tf-btn tf-btn--secondary">
            Install on iPhone
          </a>
        </div>
      </div>
    </section>
  );
}
