import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  handleGeofencePing,
  savePushSubscription,
  getVapidPublicKey,
} from "../controllers/geofenceController.js";

const router = Router();

// Public: get VAPID key for push subscription
router.get("/vapid-key", getVapidPublicKey);

// Protected: ping location
router.post("/ping", authMiddleware, handleGeofencePing);

// Protected: save push subscription
router.post("/subscribe", authMiddleware, savePushSubscription);

export default router;
