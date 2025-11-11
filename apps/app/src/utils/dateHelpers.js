export const formatLocalDateTime = (timestamp) => {
  if (!timestamp || typeof timestamp !== "string") return "";
  let dateObj;

  if (timestamp.includes("Z")) {
    // UTC timestamp
    dateObj = new Date(timestamp);
  } else {
    // Supabase format "YYYY-MM-DD HH:mm:ss.ssssss"
    const isoLike = timestamp.replace(" ", "T").split(".")[0] + "Z";
    dateObj = new Date(isoLike);
  }

  const isMobile = window.innerWidth <= 768;

  return dateObj.toLocaleString("en-US", {
    // ⬇️ Let the browser use the system time zone
    ...(isMobile
      ? {
          dateStyle: "short", // 4/29/25
          timeStyle: "short", // 11:02 AM
        }
      : {
          year: "numeric",
          month: "short", // Apr
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
  });
};
