// MatchaLab Service Worker - Handles push notifications

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || "Tienes novedades en MatchaLab",
      icon: data.icon || "/matcha-icon-192.png",
      badge: data.badge || "/matcha-icon-192.png",
      vibrate: [200, 100, 200],
      data: data.data || { url: "/" },
      actions: [
        { action: "open", title: "Ver ahora" },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "MatchaLab", options)
    );
  } catch {
    // Fallback for non-JSON payloads
    event.waitUntil(
      self.registration.showNotification("MatchaLab", {
        body: event.data.text(),
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open new window
      return clients.openWindow(url);
    })
  );
});

// Cache essential assets for offline
const CACHE_NAME = "matchalab-v1";
const STATIC_ASSETS = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
