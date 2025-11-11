self.addEventListener("push", function (event) {
  const data = event.data?.json();
  const options = {
    body: data.body,
    icon: "/images/triggerfeed-192x192.png",
    data: { url: data.url || "/" }, // ✅ pass the full URL with commentId
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const redirectUrl = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(redirectUrl)); // ✅ opens the correct full URL
});