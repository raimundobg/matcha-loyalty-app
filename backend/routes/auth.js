import { Router } from "express";
import { register, login, getMe, forgotPassword, resetPassword } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";
import { validateRegister, validateLogin } from "../middleware/validate.js";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", authMiddleware, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
