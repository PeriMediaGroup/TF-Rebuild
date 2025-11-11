import React from "react";
import { useAuth } from "../../auth/AuthContext";

const RequireCeo = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (profile?.role !== "ceo") return <p>Access denied</p>;

  return children;
};

export default RequireCeo;
