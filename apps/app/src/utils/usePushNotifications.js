import { useEffect } from "react";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export default function usePushNotifications(user, loading) {
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }

  useEffect(() => {
    if (loading || !user) return;

    const subscribeUser = async () => {
      try {
        if (!("serviceWorker" in navigator && "PushManager" in window)) return;

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const registration = await navigator.serviceWorker.ready;

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        await fetch(`${import.meta.env.VITE_SITE_URL || ""}/api/save-subscription`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            subscription: subscription.toJSON(),
          }),
        });
      } catch (err) {
        console.error("Push subscription error:", err.message);
      }
    };

    subscribeUser();
  }, [user, loading]);
}
