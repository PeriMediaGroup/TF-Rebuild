// components/debug/DebugPromote.jsx
import supabase from "../../utils/supabaseClient";

export default function DebugPromote() {
  const testUserId = "767384d3-b0fd-4003-a226-1d0d8d1d2918"; // 🔁 replace as needed

  const handleClick = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (!session) {
      console.error("No session found");
      return;
    }

    const res = await fetch("https://usvcucujzfzazszcaonb.supabase.co/functions/v1/promote-user-to-admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ targetUserId: testUserId }),
    });

    const result = await res.json();
    console.log("PROMOTE RESULT:", result);
    alert(result.success ? "✅ Success" : `❌ ${result.error}`);
  };

  return (
    <button onClick={handleClick} style={{ padding: "0.5rem", background: "#991f1f", color: "#fff" }}>
      🔧 Promote Test User (DEBUG)
    </button>
  );
}
