import webPush from "web-push";
import dotenv from "dotenv";

dotenv.config();

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webPush.setVapidDetails(
    "mailto:rai@zenlab.cl",
    VAPID_PUBLIC,
    VAPID_PRIVATE
  );
}

/**
 * Send a push notification to a subscription.
 */
export async function sendPushNotification(subscription, payload) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.warn("VAPID keys not configured, skipping push");
    return false;
  }

  try {
    await webPush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    return true;
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      // Subscription expired or invalid
      return "expired";
    }
    console.error("Push notification error:", err.message);
    return false;
  }
}
