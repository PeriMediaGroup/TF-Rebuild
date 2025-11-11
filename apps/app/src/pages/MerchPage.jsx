import { useState } from "react";
import toast from "react-hot-toast";
import "../styles/merch.scss";

const MerchPage = () => {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
      });

      const data = await res.json();

      if (data.url) {
        window.location = data.url;
      } else {
        toast.error("Unable to start checkout session.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="merch-page">
      <h2>TriggerFeed Merch</h2>
      <p>Rep the brand with official stickers and gear. More coming soon.</p>

      <div className="merch-item">
        <h3>🔥 2.5" TriggerFeed Sticker</h3>
        <img alt="2.5&quot; Vinyl Sticker" class="merch__image" src="/images/tf-sticker.png"></img>
        <p>$1.00 — High quality 2.5 inch vinyl sticker with matte finish.</p>
        <button
          className="btn btn--primary"
          onClick={handleBuy}
          disabled={loading}
        >
          {loading ? "Processing..." : "Buy Now"}
        </button>
      </div>

      {window.location.search.includes("success=true") && (
        <p className="success-message">✅ Thanks for your order! Your stickers are on the way.</p>
      )}
      {window.location.search.includes("canceled=true") && (
        <p className="error-message">❌ Checkout was canceled. No charges were made.</p>
      )}
    </div>
  );
};

export default MerchPage;
