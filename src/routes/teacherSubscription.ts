import { Router } from "express";
import {
  getTeacherPlans,
  getMyTeacherSubscription,
  upgradeTeacherSubscription,
  confirmTeacherSubscription,
  updateTeacherPlan
} from "../controllers/TeacherSubscriptionController";

import { optionalAuth, requireAuth, requireRole, requireAdminAuth } from "../middleware/auth";

const router = Router();

/**
 * Public (authenticated) – list plans
 */
router.get(
  "/plans",
  getTeacherPlans
);

/**
 * Get my subscription
 */
router.get(
  "/me",
  optionalAuth,
  getMyTeacherSubscription
);


/**
 * Upgrade – create Razorpay order
 */
router.post(
  "/upgrade",
  requireAuth,
  requireRole("teacher"),
  upgradeTeacherSubscription
);

/**
 * Confirm payment & activate plan
 */
router.post(
  "/confirm",
  requireAuth,
  requireRole("teacher"),
  confirmTeacherSubscription
);

/**
 * @route   PATCH /api/teacher-plans/:id
 * @desc    Update teacher plan (price, duration, uploadLimit, active)
 * @access  Private/Admin
 */
router.patch(
  "/plans/:id",
  requireAdminAuth,
  updateTeacherPlan
);

export default router;
