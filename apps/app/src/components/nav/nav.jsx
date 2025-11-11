import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useNotifications } from "../../auth/NotificationContext";
import { useMessages } from "../messages/MessageContext";
import { toast } from "react-hot-toast";
import { InstallButton, IosInstallPrompt } from "../common";
import "../../styles/nav.scss";

const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile, logoutUser } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { unreadDMCount } = useMessages();
  const totalUnread = (unreadCount || 0) + (unreadDMCount || 0);

  useEffect(() => {
    document.body.style.overflowY = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  const handleLogout = async () => {
    await logoutUser();
    setMenuOpen(false);
    toast.success("You are logged out, c-ya next time");
    navigate("/");
  };

  return (
    <nav className={`nav ${menuOpen ? "nav--open" : ""}`}>
      <div
        className={`nav__toggle ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        role="button"
        tabIndex={0}
      >
        <span className="nav__bar"></span>
        <span className="nav__bar"></span>
        <span className="nav__bar"></span>{" "}
        {user && totalUnread > 0 && (
          <span className="nav__badge">{totalUnread}</span>
        )}
      </div>

      <ul className="nav__menu" onClick={() => setMenuOpen(false)}>
        {user && (
          <>
            <li>
              <Link to="/profile">My Profile</Link>
            </li>
            <li>
              <Link to="/messages">
                Messages{" "}
                <span className="notification-count">
                  {unreadDMCount > 0 && `(${unreadDMCount})`}
                </span>
              </Link>
            </li>
          </>
        )}

        {user && (
          <li>
            <Link to="/notifications">
              Notifications{" "}
              <span className="notification-count">
                {unreadCount > 0 && `(${unreadCount})`}
              </span>
            </Link>
          </li>
        )}

        {!user ? (
          <li>
            <Link to="/login">Log In</Link>
          </li>
        ) : (
          <span>
            <li>
              <Link onClick={handleLogout}>Log Out</Link>
            </li>
            <div className="breaker-bar"></div>
          </span>
        )}
        {!user && (
          <span>
            <li>
              <Link to="/signup">Sign Up</Link>
            </li>
            <div className="breaker-bar"></div>
          </span>
        )}

        <li>
          <Link to="https://triggerfeed.com/">TriggerFeed Website</Link>
        </li>
        <li>
          <Link to="/">Merch Store</Link>
        </li>
        <li>
          <Link to="/about">About TriggerFeed</Link>
        </li>
        <li>
          <Link to="/members">Members</Link>
        </li>

        <li>
          <Link to="/install">Install Guide</Link>
        </li>
        <li>
          <Link to="/contact">Contact Us</Link>
        </li>
        <li>
          <Link to="/privacy">Privacy</Link>
        </li>
        {user && (profile?.role === "admin" || profile?.role === "ceo") && (
          <li>
            <Link to="/admin">Admin Dashboard</Link>
          </li>
        )}

        {typeof window !== "undefined" && (
          <>
            <li>
              <InstallButton />
            </li>
            <li>
              <IosInstallPrompt />
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Nav;
