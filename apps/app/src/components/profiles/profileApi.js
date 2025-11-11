import supabase from "../../utils/supabaseClient.js";
import reservedUsernamesList from "../../data/reservedUsernames.js";

// Create User Profile (if one doesn't exist)
export const createUserProfile = async (userId, email = "") => {
  if (!userId) return;

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Profile check error:", error.message);
    return;
  }

  if (!data) {
    const generatedUsername = `user_${userId.slice(0, 8)}`;
    const { error: insertError } = await supabase.from("profiles").insert([
      {
        id: userId,
        email,
        username: generatedUsername,
        joined_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error("Profile creation error:", insertError.message);
    } else {
      console.log("Profile created for:", userId);

      // ✅ Re-add TF-One as auto-friend
      const TF_ONE_ID = "5e42c847-367e-46f4-a363-60e034f5a9f9";
      await supabase.from("friends").upsert(
        [
          { user_id: userId, friend_id: TF_ONE_ID, status: "accepted" },
          { user_id: TF_ONE_ID, friend_id: userId, status: "accepted" },
        ],
        {
          onConflict: ["user_id", "friend_id"],
        }
      );
    }
  }
};

export const getFriendCount = async (userId) => {
  const { data, error } = await supabase
    .from("friends")
    .select("*")
    .or(
      `and(user_id.eq.${userId},status.eq.accepted),and(friend_id.eq.${userId},status.eq.accepted)`
    );

  if (error) {
    console.error("Friend count error:", error.message);
    return 0;
  }

  // ✅ Get unique friend IDs, regardless of direction
  const friendIds = new Set();
  data.forEach((row) => {
    const friendId = row.user_id === userId ? row.friend_id : row.user_id;
    friendIds.add(friendId);
  });

  return friendIds.size;
};

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, profile_image_url, city, state");

  if (error) {
    console.error("Error fetching users:", error.message);
    return [];
  }

  return data;
};

// ✅ Profile
export const fetchUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, username, email, first_name, last_name, city, state, about, dob, profile_image_url, privacy_settings, role"
    )
    .eq("id", userId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateProfile = async (userId, updates) => {
  if (!userId) return { success: false, error: "Missing userId" };

  if (updates.bio) {
    updates.about = updates.bio;
    delete updates.bio;
  }
  console.log("🚨 RAW UPDATE PAYLOAD", JSON.stringify(updates, null, 2));
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) {
    console.error("🚨 Profile Update Error:", error.message);
    return { success: false, error: error.message };
  }

  console.log("✅ Profile updated successfully.");
  return { success: true };
};

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error.message);
    return null;
  }

  return data;
};

export const checkUsername = async (username, currentUserId) => {
  const normalizedUsername = username.trim().toLowerCase();

  if (reservedUsernamesList.includes(normalizedUsername)) {
    return {
      available: false,
      reason: "This name is reserved, please contact us if this is your name",
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", normalizedUsername)
    .neq("id", currentUserId) // ✅ Ignore current user's own username
    .maybeSingle(); // safer than `.single()` for 0/1 results

  if (error && error.code !== "PGRST116") {
    console.error("Username check error:", error.message);
    return { available: false, reason: "error" };
  }

  if (data) {
    return { available: false, reason: "taken" };
  }

  return { available: true };
};

export const getProfileByUsername = async (username) => {
  const decoded = decodeURIComponent(username);
  console.log("Decoded username used for profile lookup:", decoded); // ✅ move this up here

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", decoded) // use ilike for flexible match
    .maybeSingle(); // avoids crashing on no results

  if (error) {
    console.error("getProfileByUsername error:", error.message);
    return null;
  }

  return data;
};

export const getUserPostCount = async (userId) => {
  const { count, error } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("Post count error:", error.message);
    return 0;
  }

  return count || 0;
};

export const getRankFromPostCount = (count) => {
  if (count >= 50) return "Veteran";
  if (count >= 25) return "Sharpshooter";
  if (count >= 10) return "Operator";
  if (count >= 1) return "Rookie";
  return "Fresh Mag";
};
