import React from "react";
import { useNavigate } from "react-router-dom";
import AdDashboard from "./AdDashboard";

const AdManagementPanel = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-ads-panel">
      <button
        className="admin-ads-panel__new"
        onClick={() => navigate("/admin/ads/new")}
      >
        ➕ Create New Ad
      </button>

      <AdDashboard />
    </div>
  );
};

export default AdManagementPanel;
