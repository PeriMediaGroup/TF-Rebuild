import "./header.scss";

export default function Header({ Navigation }) {
  return (
    <header className="tf-header">
      <div className="tf-header__container">
        <div className="tf-header__logo">
          <a href="/">TriggerFeed</a>
        </div>
        {Navigation && <Navigation />}
      </div>
    </header>
  );
}
