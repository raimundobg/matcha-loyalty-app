import { PrismaClient } from "@prisma/client";
import { isWithinGeofence, isNotifyHour, buildProximityMessage } from "../services/geofenceService.js";
import { sendPushNotification } from "../services/pushService.js";

const prisma = new PrismaClient();

// Rate limit: max 1 notification per user per 24 hours
const NOTIFY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export async function handleGeofencePing(req, res) {
  try {
    const { lat, lng } = req.body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.json({ nearby: false });
    }

    const { within, distance } = isWithinGeofence(lat, lng);

    if (!within) {
      return res.json({ nearby: false, distance });
    }

    // User is nearby - check if we should notify
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.json({ nearby: true, distance });
    }

    // Get ticket count for personalized message
    const ticketCount = await prisma.ticket.count({
      where: { userId: req.userId, redeemed: false },
    });

    const message = buildProximityMessage(user.username, ticketCount);

    // Check notify hour and cooldown
    const canNotify = isNotifyHour();
    const lastNotify = user.lastGeofenceNotify;
    const cooldownPassed = !lastNotify || (Date.now() - new Date(lastNotify).getTime()) > NOTIFY_COOLDOWN_MS;

    let notified = false;

    if (canNotify && cooldownPassed) {
      // Try push notification if user has a subscription
      const subscription = await prisma.pushSubscription.findFirst({
        where: { userId: req.userId },
      });

      if (subscription) {
        const result = await sendPushNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          {
            title: message.title,
            body: message.body,
            icon: "/matcha-icon-192.png",
            badge: "/matcha-icon-192.png",
            data: { url: "/dashboard" },
          }
        );

        if (result === "expired") {
          await prisma.pushSubscription.delete({ where: { id: subscription.id } });
        }

        notified = result === true;
      }

      // Update last notify time
      await prisma.user.update({
        where: { id: req.userId },
        data: { lastGeofenceNotify: new Date() },
      });
    }

    res.json({
      nearby: true,
      distance,
      message,
      notified,
      ticketCount,
    });
  } catch (err) {
    console.error("Geofence ping error:", err);
    res.json({ nearby: false });
  }
}

export async function savePushSubscription(req, res) {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: "Suscripción inválida" });
    }

    // Upsert: update if same endpoint exists, otherwise create
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId: req.userId,
      },
      create: {
        userId: req.userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Save push subscription error:", err);
    res.status(500).json({ error: "Error al guardar suscripción" });
  }
}

export async function getVapidPublicKey(req, res) {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || "" });
}
