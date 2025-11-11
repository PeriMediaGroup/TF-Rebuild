import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import supabase from "../utils/supabaseClient";
import { signInWithProvider } from "../utils/supabaseHelpers";
import { TextInput } from "../components/common";
import "../styles/login-signup.scss";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const { user, profile, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const SHOW_FACEBOOK_LOGIN = false;

  useEffect(() => {
    if (!loading && user && profile) {
      // toast("✅ Already logged in. Redirecting to Home...");
      navigate("/");
    }
  }, [user, profile, loading, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleForgotPassword = async (email) => {
    if (!email) {
      toast.error("Please enter your email first.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });

    if (error) {
      toast.error("Reset failed: " + error.message);
    } else {
      toast.success("Password reset email sent.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({ email: "", password: "", general: "" });
    const toastId = toast.loading("Logging you in...");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast.dismiss(toastId);

        // Customize based on Supabase error codes/messages
        if (error.message.toLowerCase().includes("email")) {
          setFormErrors({ ...formErrors, email: "Email not found" });
        } else if (error.message.toLowerCase().includes("password")) {
          setFormErrors({ ...formErrors, password: "Incorrect password" });
        } else {
          setFormErrors({ ...formErrors, general: error.message });
        }

        toast.error("Login failed");
        return;
      }

      toast.dismiss(toastId);
      toast.success("Login successful!");
      window.location.reload();
    } catch (err) {
      toast.dismiss(toastId);
      setFormErrors({ ...formErrors, general: "Unexpected error occurred." });
      toast.error("Unexpected login error.");
    }
  };

  const handleOAuthLogin = async (provider) => {
    const { success, error } = await signInWithProvider(provider);
    if (!success) {
      toast.error(`OAuth Login Failed: ${error}`);
    } else {
      setPendingLogin(true);
    }
  };

  return (
    <div className="login">
      <h2 className="signup__title">Log In</h2>
      <form className="form-field" onSubmit={handleSubmit}>
        <TextInput
          type="email"
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          className="form-field__input"
        />
        <TextInput
          type="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          className="form-field__input"
          value={formData.password}
          onChange={handleChange}
        />
        {formErrors.general && (
          <p className="form-field__error">
            {formErrors.general}
            &nbsp; &nbsp;
            <span
              className="form-field__forgot"
              type="button"
              onClick={() => handleForgotPassword(formData.email)}
            >
              Forgot your password?
            </span>
          </p>
        )}
        <button type="submit" className="form-field__button">
          Log In
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
