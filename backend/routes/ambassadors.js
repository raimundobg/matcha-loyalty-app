import { Router } from "express";
import {
  registerAmbassador,
  getAmbassadorDashboard,
  generateCode,
  toggleCode,
  validateCode,
} from "../controllers/ambassadorController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Protected routes (require login)
router.post("/register", authMiddleware, registerAmbassador);
router.get("/dashboard", authMiddleware, getAmbassadorDashboard);
router.post("/codes", authMiddleware, generateCode);
router.patch("/codes/:codeId/toggle", authMiddleware, toggleCode);

// Public route (validate a discount code)
router.get("/codes/validate/:code", validateCode);

export default router;
