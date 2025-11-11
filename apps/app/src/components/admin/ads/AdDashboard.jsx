import { useEffect, useState } from "react";
import supabase from "../../../utils/supabaseClient";
import { useAuth } from "../../../auth/AuthContext";
import toast from "react-hot-toast";

const AdDashboard = () => {
  const { user } = useAuth();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAds = async () => {
    setLoading(true);

    const { data: adsData, error: adsError } = await supabase
      .from("ads")
      .select("*")
      .order("created_at", { ascending: false });

    if (adsError) {
      toast.error("Failed to load ads");
      setLoading(false);
      return;
    }

    const { data: allEvents, error: eventError } = await supabase
      .from("ad_events")
      .select("ad_id, event_type");

    if (eventError) {
      toast.error("Failed to load ad stats");
      setLoading(false);
      return;
    }

    // ✅ This was missing before
    const statsByAd = {};

    for (const { ad_id, event_type } of allEvents) {
      if (!statsByAd[ad_id]) {
        statsByAd[ad_id] = { clicks: 0, impressions: 0 };
      }
      if (event_type === "click") statsByAd[ad_id].clicks++;
      if (event_type === "impression") statsByAd[ad_id].impressions++;
    }

    const enrichedAds = adsData.map((ad) => {
      const stats = statsByAd[ad.id] || { clicks: 0, impressions: 0 };
      const ctr =
        stats.impressions > 0
          ? ((stats.clicks / stats.impressions) * 100).toFixed(1)
          : "0.0";
      return { ...ad, ...stats, ctr };
    });

    setAds(enrichedAds);
    setLoading(false);
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const toggleAdStatus = async (adId, active) => {
    const { error } = await supabase
      .from("ads")
      .update({ active: !active })
      .eq("id", adId);

    if (error) {
      toast.error("Failed to update ad status");
    } else {
      toast.success(`Ad ${!active ? "activated" : "deactivated"}`);
      fetchAds();
    }
  };

  const deleteAd = async (adId) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    const { error } = await supabase.from("ads").delete().eq("id", adId);
    if (error) {
      toast.error("Failed to delete ad");
    } else {
      toast.success("Ad deleted");
      fetchAds();
    }
  };

  if (loading) return <p>Loading ads...</p>;

  return (
    <div className="admin-ads">
      <h2>Ad Management</h2>
      {ads.length === 0 ? (
        <p>No ads found.</p>
      ) : (
        <table className="admin-ads__table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
              <th>Impr.</th>
              <th>Clicks</th>
              <th>CTR</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((ad) => (
              <tr key={ad.id}>
                <td>
                  <img src={ad.image_url} alt={ad.title} width={80} />
                </td>
                <td>{ad.title}</td>
                <td>{ad.type}</td>
                <td>{ad.active ? "✅ Active" : "❌ Inactive"}</td>
                <td>{new Date(ad.created_at).toLocaleDateString()}</td>
                <td>
                  {/* placeholder for edit form */}
                  <button onClick={() => toggleAdStatus(ad.id, ad.active)}>
                    {ad.active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => deleteAd(ad.id)}>Delete</button>
                </td>
                <td>{ad.impressions}</td>
                <td>{ad.clicks}</td>
                <td>{ad.ctr}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdDashboard;
