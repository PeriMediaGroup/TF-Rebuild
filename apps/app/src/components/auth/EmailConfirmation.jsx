// components/auth/EmailConfirmation.jsx
import { Link } from "react-router-dom";
import "../../styles/auth.scss";

const EmailConfirmation = () => (
  <div className="auth-page">
    <h2 className="auth-page__title">✅ Check Your Email!</h2>
    <p className="auth-page__message">
      We’ve sent a confirmation link to your email. You must click that link to verify your account before you can log in.
    </p>
    <p className="auth-page__subtext">
      Once verified, you can log in and finish setting up your profile page.
    </p>
  </div>
);

export default EmailConfirmation;
