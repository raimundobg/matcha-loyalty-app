import { useEffect, useState, useCallback } from "react";
import api from "../services/api";

/**
 * Hook that detects proximity to MatchaLab and shows in-app notifications.
 * Uses browser Geolocation API - fires once on mount.
 * Also handles Web Push subscription for background notifications.
 */
export function useGeofence(user) {
  const [proximityInfo, setProximityInfo] = useState(null);

  // Register push subscription
  const registerPush = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    try {
      const reg = await navigator.serviceWorker.ready;

      // Get VAPID key from backend
      const { data } = await api.get("/geofence/vapid-key");
      if (!data.publicKey) return;

      // Check existing subscription
      let subscription = await reg.pushManager.getSubscription();

      if (!subscription) {
        // Ask permission and subscribe
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        subscription = await reg.pushManager.subscribe({
          userApplicationServerKey: data.publicKey,
          applicationServerKey: data.publicKey,
        });
      }

      // Send subscription to backend
      const subJson = subscription.toJSON();
      await api.post("/geofence/subscribe", {
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        },
      });
    } catch (err) {
      // Silent - push is optional
      console.debug("Push registration skipped:", err.message);
    }
  }, []);

  // Ping geofence
  const checkLocation = useCallback(async () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { data } = await api.post("/geofence/ping", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });

          if (data.nearby) {
            setProximityInfo(data);
          }
        } catch {
          // Silent failure
        }
      },
      () => {}, // Permission denied - ignore
      { timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    if (!user) return;

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Small delay to not block initial render
    const timer = setTimeout(() => {
      registerPush();
      checkLocation();
    }, 2000);

    return () => clearTimeout(timer);
  }, [user?.id]);

  return proximityInfo;
}
