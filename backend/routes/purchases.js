import { Router } from "express";
import { createPurchase, getPurchases } from "../controllers/purchaseController.js";
import { authMiddleware } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.post("/", authMiddleware, upload.single("voucher"), createPurchase);
router.get("/", authMiddleware, getPurchases);

export default router;
