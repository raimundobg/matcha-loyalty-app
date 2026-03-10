import { Router } from "express";
import {
  submitApplication,
  listApplications,
  approveApplication,
  rejectApplication,
  listAmbassadors,
  adminResetPassword,
} from "../controllers/adminController.js";

const router = Router();

// Public - submit application
router.post("/applications", submitApplication);

// Admin-only routes (require x-admin-secret header)
router.get("/applications", listApplications);
router.post("/applications/:id/approve", approveApplication);
router.post("/applications/:id/reject", rejectApplication);
router.get("/ambassadors", listAmbassadors);
router.post("/reset-password", adminResetPassword);

export default router;
