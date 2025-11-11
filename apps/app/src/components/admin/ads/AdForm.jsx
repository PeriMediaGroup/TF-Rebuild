import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../../utils/supabaseClient";
import { useAuth } from "../../../auth/AuthContext";
import AdPreview from "./AdPreview";
import toast from "react-hot-toast";

const CLOUDINARY_CLOUD_NAME = "triggerfeed";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const AdForm = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    destination_url: "",
    type: "square",
    start_date: "",
    end_date: "",
    active: true,
    client_id: "",
    image_url: "",
    mobile_image_url: "",
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { id } = useParams();
  const isEditMode = Boolean(id);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from("ad_clients")
        .select("*")
        .order("name");
      if (error) toast.error("Failed to load ad clients");
      else setClients(data);
    };
    fetchClients();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: form,
        }
      );
      const data = await res.json();
      setFormData((prev) => ({ ...prev, image_url: data.secure_url }));
      toast.success("Image uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleMobileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: form,
        }
      );
      const data = await res.json();
      setFormData((prev) => ({ ...prev, mobile_image_url: data.secure_url }));
      toast.success("Mobile image uploaded!");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.image_url ||
      !formData.type ||
      !formData.client_id
    ) {
      toast.error("Please fill out all required fields");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase
      .from("ads")
      .insert([{ ...formData, created_by: user.id }]);
    if (error) {
      toast.error("Failed to create ad");
    } else {
      toast.success("Ad created!");
      // Optionally redirect or reset form
    }
    setSubmitting(false);
  };

  return (
    <div className="ad-form">
      <h2>Create New Ad</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Title*:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Destination URL:
          <input
            type="url"
            name="destination_url"
            value={formData.destination_url}
            onChange={handleChange}
          />
        </label>

        <label>
          Ad Type*:
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="square">Square (250x250)</option>
            <option value="banner">Banner (728x90)</option>
            <option value="skyscraper">Skyscraper (160x600)</option>
            <option value="mobile">Mobile (320x100)</option>
          </select>
        </label>

        <label>
          Client*:
          <select
            name="client_id"
            value={formData.client_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Client --</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Start Date:
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
          />
        </label>

        <label>
          End Date:
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
          />
        </label>

        <label>
          Active:
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleChange}
          />
        </label>

        <label>
          Upload Image*:
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </label>
        <label>
          Upload Mobile Version (optional):
          <input
            type="file"
            accept="image/*"
            onChange={handleMobileImageUpload}
          />
        </label>

        <AdPreview
          image_url={formData.image_url}
          mobile_image_url={formData.mobile_image_url}
          title={formData.title}
          type={formData.type}
        />

        <button type="submit" disabled={uploading || submitting}>
          {submitting ? "Submitting..." : "Create Ad"}
        </button>
      </form>
    </div>
  );
};

export default AdForm;
