import supabase from "../../../utils/supabaseClient";

export const logAdImpression = async ({ adId, userId, ipAddress, userAgent }) => {
  await supabase.from("ad_events").insert([
    {
      ad_id: adId,
      event_type: "impression",
      user_id: userId || null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    },
  ]);
};

export const logAdClick = async ({ adId, userId, ipAddress, userAgent }) => {
  await supabase.from("ad_events").insert([
    {
      ad_id: adId,
      event_type: "click",
      user_id: userId || null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    },
  ]);
};