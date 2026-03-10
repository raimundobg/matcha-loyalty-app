import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import purchaseRoutes from "./routes/purchases.js";
import ticketRoutes from "./routes/tickets.js";
import geofenceRoutes from "./routes/geofence.js";
import ambassadorRoutes from "./routes/ambassadors.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes, intenta más tarde" },
});

// Middleware
const isProduction = process.env.NODE_ENV === "production";
app.use(cors({ origin: isProduction ? true : "*" }));
if (isProduction) app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" }));
app.use(limiter);

// Serve uploaded files (local storage fallback)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/auth", authRoutes);
app.use("/purchases", purchaseRoutes);
app.use("/tickets", ticketRoutes);
app.use("/geofence", geofenceRoutes);
app.use("/ambassadors", ambassadorRoutes);
app.use("/admin", adminRoutes);
// Alias /user/me
app.get("/user/me", (req, res, next) => {
  req.url = "/auth/me";
  authRoutes(req, res, next);
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(frontendPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
