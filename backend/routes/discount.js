import { Router } from "express";
import { activateVoucher, getVoucher } from "../controllers/discountController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

// Activate a discount code → get a time-stamped voucher
router.post("/activate", optionalAuth, activateVoucher);

// Check voucher status (public — store staff can verify)
router.get("/voucher/:id", getVoucher);

export default router;
