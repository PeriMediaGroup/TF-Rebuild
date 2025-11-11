// cloudinaryHelpers.js

export async function uploadVideo(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "triggerfeed_unsigned"); // same preset used for images

  const response = await fetch("https://api.cloudinary.com/v1_1/triggerfeed/video/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Cloudinary video upload failed: ${error.error.message}`);
  }

  const data = await response.json();
  return data.secure_url; // ✅ Use this URL for post.video_url
}

export async function uploadProfileImage(userId, file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "triggerfeed_unsigned");
  formData.append("public_id", `profile-pics/${userId}`); // ✅ goes to correct folder

  const response = await fetch("https://api.cloudinary.com/v1_1/triggerfeed/image/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Cloudinary upload failed: ${error.error.message}`);
  }

  const data = await response.json();
  return data.secure_url; // ✅ Use this URL for profile_image_url
}

export async function uploadBannerImage(userId, file) {
  const timestamp = Date.now(); // or use uuid if you prefer
  const publicId = `profile-banners/${userId}_${timestamp}`; // ✅ force unique filename

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "triggerfeed_unsigned");
  formData.append("public_id", publicId);

  const response = await fetch("https://api.cloudinary.com/v1_1/triggerfeed/image/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Cloudinary banner upload failed: ${error.error.message}`);
  }

  const data = await response.json();
  return data.secure_url;
}
