import { Router } from "express";
import {
  createStudentSubscription,
  getMySubscription,
  cancelMySubscription,
} from "../controllers/StudentSubscriptionController";
import { requireAuth } from "../middleware/auth";

const router = Router();

/**
 * Student subscription routes
 * Base: /api/student-subscription
 */
router.post("/create", requireAuth, createStudentSubscription);
router.get("/me", requireAuth, getMySubscription);
router.post("/cancel", requireAuth, cancelMySubscription);

export default router;
