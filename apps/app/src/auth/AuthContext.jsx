import { createContext, useContext, useState, useEffect } from "react";
import supabase from "../utils/supabaseClient";
import { createUserProfile } from "../components/profiles/profileApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  const logoutUser = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshUser = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const sessionUser = session?.user || null;

      if (sessionUser) {
        setUser(sessionUser);

        // Check if profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", sessionUser.id)
          .maybeSingle();

        if (!existingProfile) {
          // Create profile
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: sessionUser.id,
              email: sessionUser.email,
              username: "",
              profile_image_url: "",
              role: "user",
              badges: [],
              is_banned: false,
              is_muted: false,
            });

          if (insertError) {
            console.error("Profile creation error:", insertError.message);
          } else {
            setNeedsProfileSetup(true); // 👈 Set flag if it's brand new
          }
        }

        // Fetch full profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, username, email, role, profile_image_url, badges, is_banned, is_muted")
          .eq("id", sessionUser.id)
          .single();

        setProfile(profileData);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error("AuthContext refreshUser Error:", error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser(); // Initial load
  }, []);

  useEffect(() => {
    if (user?.id && user?.email) {
      createUserProfile(user.id, user.email);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, logoutUser, refreshUser, needsProfileSetup }}
    >
      {!loading ? children : <div className="loading-screen">Loading...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
