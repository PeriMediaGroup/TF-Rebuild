import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirect_to");

    if (redirectTo) {
      // Clean up the URL and redirect
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate(redirectTo);
    }
  }, [navigate]);

  return null;
};

export default RedirectHandler;
