import { Link } from "react-router-dom";
import Navigation from "../nav/nav";
import "../../styles/header.scss";

const Header = () => {
  return (
    <header className="header">
      <div className="header__content">
        <Link to="/" className="header__logo">
          <span className="header__logo-text">TriggerFeed</span>
        </Link>
      </div>
      <Navigation />
    </header>
  );
};

export default Header;
