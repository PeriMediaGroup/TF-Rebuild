import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import supabase from "../../utils/supabaseClient";
import { promoteUserToAdmin } from "../../utils/supabaseHelpers";
import AdManagementPanel from "../admin/ads/AdManagementPanel";
import "../../styles/admins.scss";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { profile } = useAuth();
  const isCeo = profile?.role === "ceo";
  const isMobile = window.innerWidth < 769;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openUserIds, setOpenUserIds] = useState([]);
  const [activeTab, setActiveTab] = useState("users");

  const toggleRow = (id) => {
    setOpenUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "users":
        return (
          <section className="admin-dashboard__section">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="admin-dashboard__table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Flagged</th>
                    <th>Deleted</th>
                    {isCeo && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isOpen = !isMobile || openUserIds.includes(user.id);
                    return (
                      <tr
                        key={user.id}
                        className={`admin-dashboard__row ${isOpen ? "open" : ""}`}
                      >
                        <td data-label="Username">
                          <button
                            className="admin-dashboard__user-toggle"
                            onClick={() => toggleRow(user.id)}
                          >
                            @{user.username || "Unknown"}
                          </button>
                        </td>

                        {isOpen && (
                          <>
                            <td data-label="Role">{user.role}</td>
                            <td data-label="Joined">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td
                              data-label="Flagged"
                              className={user.flaggedCount >= 3 ? "warn" : ""}
                            >
                              {user.flaggedCount}
                            </td>
                            <td data-label="Deleted">{user.deletedCount}</td>
                            {isCeo && (
                              <td data-label="Actions">
                                {user.role === "user" ? (
                                  <button
                                    onClick={() => handlePromote(user.id)}
                                    className="admin-dashboard__promote"
                                  >
                                    Promote to Admin
                                  </button>
                                ) : (
                                  <span>n/a</span>
                                )}
                              </td>
                            )}
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>
        );
      case "ads":
        return (
          <section className="admin-dashboard__section">
            <AdManagementPanel />
          </section>
        );
      case "tools":
        return (
          <section className="admin-dashboard__section">
            <p className="admin-dashboard__coming-soon">
              🚧 More tools coming soon: Flag Review Queue, Post Metrics,
              Shadowbanning, and more.
            </p>
          </section>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      const { data, error } = await supabase.from("profiles").select(`
        id,
        username,
        role,
        created_at,
        posts:posts(flagged),
        deletions:post_deletions!post_deletions_user_id_fkey(id)
      `);

      if (error) {
        toast.error("Failed to load users: " + error.message);
        return;
      }

      const transformed = data.map((user) => ({
        ...user,
        flaggedCount: user.posts?.filter((p) => p.flagged).length || 0,
        deletedCount: user.deletions?.length || 0,
      }));

      setUsers(transformed);
      setLoading(false);
    };

    loadUsers();
  }, []);

  const handlePromote = async (userId) => {
    const result = await promoteUserToAdmin(userId);
    if (result?.success) {
      toast.success("User promoted to admin.");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: "admin" } : u))
      );
    } else {
      toast.error("Promotion failed.");
    }
  };

  return (
    <div className="admin-dashboard">
      <h2 className="admin-dashboard__title">Admin Dashboard</h2>

      <div className="admin-dashboard__tabs">
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          📋 User Moderation
        </button>
        <button
          className={activeTab === "ads" ? "active" : ""}
          onClick={() => setActiveTab("ads")}
        >
          📢 Ad Management
        </button>
        <button
          className={activeTab === "tools" ? "active" : ""}
          onClick={() => setActiveTab("tools")}
        >
          ⚙️ Future Tools
        </button>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default AdminDashboard;
