import { useState } from "react";
import toast from "react-hot-toast";
import { signUp, signInWithProvider } from "../utils/supabaseHelpers";
import { useNavigate } from "react-router-dom";
import { TextInput } from "../components/common";
import "../styles/login-signup.scss";

const SignupPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ error: "", success: "" });
  const [agreed, setAgreed] = useState(false);
  const [isAdult, setIsAdult] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const navigate = useNavigate();
  const SHOW_FACEBOOK_LOGIN = false;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: "", success: "" });

    if (formData.password) {
      const pw = formData.password;
      const strongPassword = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
      if (!strongPassword.test(pw)) {
        toast.error(
          "Password must be at least 8 characters, include a number, a letter, and a special character."
        );
        return;
      }
    }

    if (!agreed || !isAdult) {
      toast.error(
        !agreed
          ? "You must agree to the Terms & Conditions."
          : "You must confirm you are 18 or older."
      );
      return;
    }

    try {
      const { success, error } = await signUp(
        formData.email,
        formData.password,
        navigate
      );
      if (success) {
        try {
          // Get session to retrieve user ID and email
          const { data: sessionData } = await supabase.auth.getSession();
          const session = sessionData?.session;

          if (session?.user) {
            await fetch("/functions/v1/create-profile-and-friend", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id: session.user.id,
                email: session.user.email,
                username: "", // optional
              }),
            });
          }
        } catch (err) {
          console.error("Auto-profile/friend error:", err.message);
        }

        toast.success(
          "✅ Sign-up successful! Check your email and then log in."
        );
      } else {
        setStatus({ error: error || "Unknown error occurred." });
      }
    } catch (err) {
      toast.error(`Unexpected error: ${err.message}`);
    }
  };

  const handleOAuthLogin = async (provider) => {
    const { success, error } = await signInWithProvider(provider);
    if (!success) {
      toast.error(`OAuth Login Failed: ${error}`);
    }
  };

  return (
    <div className="signup">
      <h2 className="signup__title">Sign Up for TriggerFeed</h2>

      <form onSubmit={handleSubmit} className="form-field">
        <div className="signup__terms-toggle">
          <button
            type="button"
            className="signup__toggle-button"
            onClick={() => setShowTerms(!showTerms)}
          >
            {showTerms
              ? "▼ Hide Terms & Conditions"
              : "▶ Show Terms & Conditions"}
          </button>

          {showTerms && (
            <div className="signup__terms-scroll">
              <h2>Terms, Conditions & Vibe</h2>
              <p>
                Welcome to TriggerFeed — a platform for freedom, fun, and
                firearms. Before you dive in, here's the deal:
              </p>

              <ul>
                <li>
                  <strong>Be respectful</strong> — don’t be a dick. Seriously.
                </li>
                <li>
                  <strong>No hate speech</strong> — racism, sexism, threats, or
                  targeted harassment? Get out.
                </li>
                <li>
                  <strong>Keep it legal</strong> — no posting or promoting
                  illegal activity. We're not going down for your bad decisions.
                </li>
                <li>
                  <strong>Leave politics & religion at the door</strong> — this
                  isn’t the place for hot takes or holy wars (Try X for that).
                </li>
                <li>
                  <strong>Have fun</strong> — share cool gear, cool moments, and
                  make cool friends.
                </li>
              </ul>

              <h3>Your Info:</h3>
              <ul>
                <li>We don’t sell your data. Ever.</li>
                <li>
                  We collect what we need to make the app work (like your
                  email), and that's it.
                </li>
              </ul>

              <h3>You agree to:</h3>
              <ul>
                <li>Follow local, state, and federal laws.</li>
                <li>Be 18+</li>
                <li>
                  Accept that TriggerFeed can boot anyone violating these terms.
                </li>
              </ul>
            </div>
          )}

          <label className="signup__checkbox">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            &nbsp;I have read and agree to the Terms & Conditions
          </label>
          <label className="signup__checkbox">
            <input
              type="checkbox"
              checked={isAdult}
              onChange={(e) => setIsAdult(e.target.checked)}
            />
            &nbsp;I confirm that I am 18 years of age or older
          </label>
        </div>

        <TextInput
          type="email"
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
        />
        <TextInput
          type="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit" className="form-field__button">
          Create Account
        </button>

        <p className="signup-page__notice">
          <strong>Important:</strong> You must verify your email to complete
          registration.
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
