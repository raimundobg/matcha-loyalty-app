import { Router } from "express";
import { getTickets, redeemTickets } from "../controllers/ticketController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, getTickets);
router.post("/redeem", authMiddleware, redeemTickets);

export default router;
