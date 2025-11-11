import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { fetchUserProfile, updateProfile, checkUsername } from "./profileApi";
import {
  uploadProfileImage,
  uploadBannerImage,
} from "../../utils/cloudinaryHelpers";
import { BackButton, TextInput } from "../common";
import "../../styles/profile.scss";

const EditProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({});
  const [privacy_settings, setPrivacySettings] = useState({});

  useEffect(() => {
    const loadProfile = async () => {
      const data = await fetchUserProfile(user.id);
      setProfile(data);
      setFormData({
        username: data.username ?? "",
        first_name: data.first_name ?? "",
        last_name: data.last_name ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        about: data.about ?? "",
        dob: data.dob ? data.dob.split("T")[0] : "", // Format date clean
        profile_image_url: data.profile_image_url ?? "",
      });

      setPrivacySettings(data.privacy_settings || {});
    };

    loadProfile();
  }, [user.id]);

  useEffect(() => {
    return () => {
      if (formData.new_profile_image_preview?.startsWith("blob:")) {
        URL.revokeObjectURL(formData.new_profile_image_preview);
      }
    };
  }, []);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const togglePrivacy = (field) => {
    setPrivacySettings({
      ...privacy_settings,
      [field]: !privacy_settings[field],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let bannerImageUrl = profile.banner_url;

    if (formData.banner_image) {
      bannerImageUrl = await uploadBannerImage(user.id, formData.banner_image);
    }

    if (formData.new_password) {
      const pw = formData.new_password;
      const strongPassword = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
      if (!strongPassword.test(pw)) {
        toast.error(
          "Password must be at least 8 characters, include a number, a letter, and a special character."
        );
        return;
      }
    }

    if (formData.username && formData.username !== profile.username) {
      const cleaned = formData.username.trim();
      const isValid = /^[a-zA-Z0-9._-]+$/.test(cleaned);
      if (!isValid) {
        toast.error(
          "Username can only contain letters, numbers, underscores, dashes, or periods. No spaces or special characters."
        );
        return;
      }

      const { available, reason } = await checkUsername(cleaned, user.id);
      if (!available) {
        toast.error(
          reason === "reserved"
            ? "Username is reserved"
            : "Username already taken"
        );
        return;
      }
    }

    let profileImageUrl = formData.profile_image_url;

    if (formData.new_profile_image) {
      profileImageUrl = await uploadProfileImage(
        user.id,
        formData.new_profile_image
      );
    }

    const {
      new_profile_image,
      new_profile_image_preview,
      new_password,
      banner_image,
      banner_preview,
      ...sanitizedFormData
    } = formData;

    // Ensure date is null if empty (Postgres-safe)
    if (sanitizedFormData.dob === "") {
      sanitizedFormData.dob = null;
    }

    const updated = {
      ...sanitizedFormData,
      profile_image_url: profileImageUrl,
      banner_url: bannerImageUrl,
      privacy_settings,
    };

    const { success, error } = await updateProfile(user.id, updated);
    if (success) {
      toast.success("Profile updated!");
      setTimeout(() => {
        window.location.href = "/profile";
      }, 1500);
    } else {
      toast.error("Failed to update profile.");
      console.error("Profile update failed:", error);
    }
  };

  const renderField = (fieldName, label, type = "text") => (
    <div className="edit-profile__field">
      <TextInput
        label={label}
        type={type}
        name={fieldName}
        value={formData[fieldName] || ""}
        onChange={(e) => handleChange(fieldName, e.target.value)}
        className="edit-profile__input"
      />
      {!["username", "about"].includes(fieldName) && (
        <label className="edit-profile__privacy">
          <input
            type="checkbox"
            checked={privacy_settings[fieldName] || false}
            onChange={() => togglePrivacy(fieldName)}
          />
          Private?
        </label>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="edit-profile">
      <h2>Edit Profile</h2>
      <div className="edit-profile__banner">
        <label htmlFor="banner">Banner Image : </label>
        <input
          id="banner"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            const previewUrl = URL.createObjectURL(file);

            setFormData((prev) => ({
              ...prev,
              banner_image: file,
              banner_preview: previewUrl,
            }));
          }}
        />
        {formData.banner_preview && (
          <img
            src={formData.banner_preview}
            alt="New banner preview"
            className="edit-profile__banner-preview"
          />
        )}
      </div>

      <div className="edit-profile__field">
        <label htmlFor="profile-image">Profile Avatar</label>
        <div className="edit-profile__avatar-preview">
          <img
            id="profile-image"
            src={profile.profile_image_url || "/images/default-avatar.png"}
            alt="Current profile avatar"
          />
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            const previewUrl = URL.createObjectURL(file);

            setFormData((prev) => ({
              ...prev,
              new_profile_image: file,
              new_profile_image_preview: previewUrl,
            }));
          }}
        />
        {formData.new_profile_image_preview && (
          <img
            src={formData.new_profile_image_preview}
            alt="New preview"
            style={{ width: "80px", marginTop: "0.5rem", borderRadius: "8px" }}
          />
        )}
      </div>

      {renderField("username", "Username")}
      {renderField("first_name", "First Name")}
      {renderField("last_name", "Last Name")}
      {renderField("city", "City")}
      {renderField("state", "State")}

      <div className="edit-profile__field">
        <label>About You</label>
        <textarea
          rows={6}
          style={{ height: "200px" }}
          value={formData.about || ""}
          onChange={(e) => handleChange("about", e.target.value)}
        />
      </div>

      <div className="edit-profile__field">
        <TextInput
          type="password"
          name="new_password"
          label="New Password"
          placeholder="Leave blank to keep current password"
          autoComplete="new-password"
          value={formData.new_password || ""}
          onChange={(e) => handleChange("new_password", e.target.value)}
        />
      </div>

      {renderField("dob", "Date of Birth", "date")}

      <div className="edit-profile__buttons">
        <button type="submit">Save</button>
        <BackButton />
      </div>
    </form>
  );
};

export default EditProfile;
