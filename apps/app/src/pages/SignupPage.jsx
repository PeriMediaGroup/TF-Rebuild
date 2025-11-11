import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { signUp } from "../utils/supabaseHelpers";
import { useNavigate } from "react-router-dom";
import { TextInput } from "../components/common";
import reservedUsernames from "../data/reservedUsernames";
import "../styles/login-signup.scss";
import debounce from "lodash.debounce";
import supabase from "../utils/supabaseClient";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [status, setStatus] = useState({ error: "", success: "" });
  const [agreed, setAgreed] = useState(false);
  const [isAdult, setIsAdult] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  // "checking" | "available" | "taken" | "reserved"
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const checkUsername = async (username) => {
    if (!username) {
      setUsernameStatus(null);
      setUsernameSuggestions([]);
      return;
    }

    const lower = username.toLowerCase();

    // Reserved first
    if (reservedUsernames.includes(lower)) {
      setUsernameStatus("reserved");
      setUsernameSuggestions([]);
      return;
    }

    setUsernameStatus("checking");
    setUsernameSuggestions([]);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .eq("is_deleted", false)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setUsernameStatus("taken");

        // Generate 3 backup suggestions
        const base = username.replace(/[^a-zA-Z0-9_]/g, "");
        const random = Math.floor(Math.random() * 999);
        const suffix = new Date().getFullYear().toString().slice(-2);
        setUsernameSuggestions([
          `${base}_tf`,
          `${base}${suffix}`,
          `${base}${random}`,
        ]);
      } else {
        setUsernameStatus("available");
        setUsernameSuggestions([]);
      }
    } catch (err) {
      console.error("Username check failed:", err.message);
      setUsernameStatus(null);
    }
  };

  const debouncedCheck = debounce(checkUsername, 500);

  useEffect(() => {
    if (formData.email && !formData.username) {
      const suggestion = formData.email
        .split("@")[0]
        .replace(/[^a-zA-Z0-9_]/g, "");
      setFormData((prev) => ({ ...prev, username: suggestion }));
    }
  }, [formData.email]);

  useEffect(() => {
    debouncedCheck(formData.username);
    return () => debouncedCheck.cancel();
  }, [formData.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: "", success: "" });

    const { email, password, username } = formData;

    // Basic validation
    if (!email || !password || !username) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!agreed || !isAdult) {
      toast.error(
        !agreed
          ? "You must agree to the Terms & Conditions."
          : "You must confirm you are 18 or older."
      );
      return;
    }

    // ✅ Check reserved usernames
    if (reservedUsernames.includes(username.toLowerCase())) {
      toast.error("That username is reserved. Please choose another.");
      return;
    }

    // ✅ Check if username already exists in Supabase
    try {
      const { data: existing, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .eq("is_deleted", false)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        toast.error("That username is already taken.");
        return;
      }
    } catch (err) {
      console.error("Username check failed:", err.message);
      toast.error("Could not verify username availability.");
      return;
    }

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

    try {
      const { success, error } = await signUp(email, password, navigate);
      if (success) {
        try {
          // Get session to retrieve user ID and email
          const { data: sessionData } = await supabase.auth.getSession();
          const session = sessionData?.session;

          if (session?.user) {
            await supabase
              .from("profiles")
              .update({ username })
              .eq("id", session.user.id)
              .eq("is_deleted", false);
          }
        } catch (err) {
          console.error("Profile update error:", err.message);
        }

        toast.success(
          "✅ Signup successful! Check your email and then log in."
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
      <h2 className="signup__title">Join TriggerFeed</h2>

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
          type="text"
          name="username"
          label="User Name"
          placeholder="what should we call ya"
          autoComplete="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <div className="username-status">
          {usernameStatus === "checking" && <span>Checking...</span>}

          {usernameStatus === "available" && (
            <span style={{ color: "limegreen" }}>✅ Available</span>
          )}

          {usernameStatus === "taken" && (
            <span style={{ color: "crimson" }}>
              ❌ Taken —{" "}
              <a
                href={`mailto:support@triggerfeed.com?subject=Username Claim: ${encodeURIComponent(formData.username)}&body=Hey TriggerFeed team, %0D%0A%0D%0A I'd like to claim the username "${formData.username}". %0D%0A Here's why I believe it should belong to me: %0D%0A%0D%0A [Add your reasoning here] %0D%0A%0D%0A Thanks!`}
                style={{ color: "goldenrod", textDecoration: "underline" }}
              >
                let us know
              </a>{" "}
              if you believe this name shouldn’t be used.
            </span>
          )}

          {usernameStatus === "reserved" && (
            <span style={{ color: "gold" }}>
              ⚠ This username is reserved.{" "}
              <a
                href={`mailto:support@triggerfeed.com?subject=Username Claim: ${encodeURIComponent(formData.username)}&body=Hey TriggerFeed team, %0D%0A%0D%0A I'd like to claim the username "${formData.username}". %0D%0A Here's why I believe it should belong to me: %0D%0A%0D%0A [Add your reasoning here] %0D%0A%0D%0A Thanks!`}
                style={{ color: "goldenrod", textDecoration: "underline" }}
              >
                Claim this name
              </a>
            </span>
          )}
          {usernameStatus === "taken" && usernameSuggestions.length > 0 && (
            <div className="username-suggestions">
              <p style={{ color: "#aaa" }}>Try one of these:</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {usernameSuggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, username: sug }))
                    }
                    style={{
                      background: "#222",
                      color: "#fff",
                      border: "1px solid #444",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      cursor: "pointer",
                    }}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <TextInput
          type="email"
          name="email"
          label="Email"
          placeholder="addy"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />
        <TextInput
          type="password"
          name="password"
          label="Password"
          placeholder="make it good"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          required
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
