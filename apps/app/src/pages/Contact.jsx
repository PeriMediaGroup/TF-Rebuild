// src/pages/Contact.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import supabase from "../utils/supabaseClient";
import "../styles/contact.scss";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, message } = formData;

    if (!name || !email || !message) {
      toast.error("All fields are required.");
      return;
    }
    if (name.length > 60 || email.length > 100 || message.length > 1000) {
      toast.error("One or more fields exceed the maximum length.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("contact_messages").insert([{ name, email, message }]);

    if (error) {
      console.error("Error saving contact message:", error);
      toast.error("Something went wrong. Try again.");
      setLoading(false);
      return;
    }

    await fetch("/api/send-contact-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message })
    });

    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="contact-page">
        <h2>Thank you, {formData.name}!</h2>
        <p>We’ve received your message and will get back to you at <strong>{formData.email}</strong> as soon as possible.</p>
        <p>You’re helping TriggerFeed grow — we appreciate it.</p>
        <Link to="/" className="btn btn--primary" style={{ marginTop: "1.5rem" }}>
          ← Back to the Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="contact-page">
      <h2>Contact Us</h2>
      <p>If you have questions, feedback, or support needs, send us a message below. We're here for you.</p>

      <form onSubmit={handleSubmit} className="contact-form">
        <input
          type="text"
          name="name"
          placeholder="Your name"
          maxLength={60}
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Your email"
          maxLength={100}
          value={formData.email}
          onChange={handleChange}
        />
        <textarea
          name="message"
          placeholder="Your message"
          rows={6}
          maxLength={1000}
          value={formData.message}
          onChange={handleChange}
        ></textarea>
        <div className="char-count">
          {formData.message.length}/1000 characters
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>

      <div className="contact-alt">
        <p>📧 Email: <a href="mailto:support@triggerfeed.com">support@triggerfeed.com</a></p>
        <p>📞 Call/Text: <a href="tel:8643729393">864-372-9393</a></p>
      </div>
    </div>
  );
};

export default Contact;