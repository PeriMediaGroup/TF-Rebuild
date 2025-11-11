// utils/uploadVideo.js
export const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) throw new Error("Video upload failed");

  const data = await response.json();
  return data.secure_url; // Optimized Cloudinary video URL
};
