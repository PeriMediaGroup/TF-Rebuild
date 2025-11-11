import toast from "react-hot-toast";
import supabase from "../../utils/supabaseClient";
import { createNotification } from "../notifications/notificationApi";
import { pushFriendRequest, pushFriendAccepted } from "../../utils/push";

export const fetchUserFriends = async (userId) => {
  const { data: sent, error: errorSent } = await supabase
    .from("friends")
    .select("friend_id, profiles:friend_id (id, username)")
    .eq("user_id", userId)
    .eq("status", "accepted");

  const { data: received, error: errorReceived } = await supabase
    .from("friends")
    .select("user_id, profiles:user_id (id, username)")
    .eq("friend_id", userId)
    .eq("status", "accepted");

  if (errorSent || errorReceived) {
    toast.error("fetchUserFriends error:", errorSent || errorReceived);
    return [];
  }

  const allFriends = [
    ...sent.map((f) => f.profiles),
    ...received.map((f) => f.profiles),
  ];

  return allFriends;
};

// Send friend request
export const sendFriendRequest = async (
  userId,
  friendId,
  senderUsername,
  senderAvatar = "/images/default-avatar.png"
) => {
  if (!senderUsername) {
    // 🧠 Fetch sender info if missing
    const { data: senderProfile, error } = await supabase
      .from("profiles")
      .select("username, profile_image_url")
      .eq("id", userId)
      .single();

    if (error || !senderProfile) {
      console.error("Failed to fetch sender profile for notification:", error);
      toast.error("Unable to send friend request.");
      return false;
    }

    senderUsername = senderProfile.username;
    senderAvatar = senderProfile.profile_image_url || senderAvatar;
  }

  const { error } = await supabase
    .from("friends")
    .insert([{ user_id: userId, friend_id: friendId, status: "pending" }]);

  if (error) {
    toast.error("Send friend request error:", error.message);
    return false;
  }

  await createNotification({
    user_id: friendId,
    type: "friend_request",
    data: {
      from_user_id: userId,
      from_username: senderUsername,
      from_profile_image_url: senderAvatar,
    },
  });

  await pushFriendRequest({
    toUserId: friendId,
    fromUsername: senderUsername,
  });

  return true;
};

// Accept or reject a request
export const respondToFriendRequest = async (userId, friendId, status) => {
  if (status === "accepted") {
    const { error } = await supabase
      .from("friends")
      .update({ status: "accepted" })
      .eq("user_id", friendId)
      .eq("friend_id", userId);

    if (error) {
      toast.error("Respond to friend request error:", error.message);
      return false;
    }

    // ✅ Notify the original requester
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .single();

    if (userProfile?.username) {
      await createNotification({
        user_id: friendId,
        type: "friend_accept",
        data: {
          from_user_id: userId,
          from_username: userProfile.username,
        },
      });

      await pushFriendAccepted({
        toUserId: friendId,
        fromUsername: userProfile.username,
      });
    }

    return true;
  } else if (status === "declined") {
    const { error } = await supabase
      .from("friends")
      .delete()
      .eq("user_id", friendId)
      .eq("friend_id", userId);

    if (error) {
      toast.error("Decline friend request error:", error.message);
      return false;
    }
    return true;
  } else {
    console.warn("Invalid status:", status);
    return false;
  }
};

// Fetch incoming requests
export const fetchIncomingRequests = async (userId) => {
  const { data, error } = await supabase
    .from("friends")
    .select(`
      user_id,
      profiles:user_id (
        id,
        username
      )
    `)
    .eq("friend_id", userId)
    .eq("status", "pending");

  if (error) {
    console.error("Fetch incoming requests error:", error.message);
    return [];
  }
  return data;
};

// Fetch sent requests
export const fetchSentRequests = async (userId) => {
  const { data, error } = await supabase
    .from("friends")
    .select(`
      friend_id,
      profiles:friend_id (
        id,
        username
      )
    `)
    .eq("user_id", userId)
    .eq("status", "pending");

  if (error) {
    console.error("Fetch sent requests error:", error.message);
    return [];
  }
  return data;
};

export const unfriend = async (userId, friendId) => {
  const { error } = await supabase
    .from("friends")
    .delete()
    .or(`and(user_id.eq.${userId}, friend_id.eq.${friendId}),and(user_id.eq.${friendId}, friend_id.eq.${userId})`);

  if (error) {
    console.error("Unfriend error:", error.message);
    return false;
  }
  return true;
};
