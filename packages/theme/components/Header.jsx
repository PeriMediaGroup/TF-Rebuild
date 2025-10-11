import Navigation from "../../../apps/web/src/components/Navigation";
import "./header.scss";

export default function Header() {
  return (
    <header className="tf-header">
      <div className="tf-header__container">
        <div className="tf-header__logo">
          <a href="/">TriggerFeed</a>
        </div>
        <Navigation />
      </div>
    </header>
  );
}
