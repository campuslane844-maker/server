"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TeacherSubscriptionController_1 = require("../controllers/TeacherSubscriptionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * Public (authenticated) – list plans
 */
router.get("/plans", TeacherSubscriptionController_1.getTeacherPlans);
/**
 * Get my subscription
 */
router.get("/me", auth_1.optionalAuth, TeacherSubscriptionController_1.getMyTeacherSubscription);
/**
 * Upgrade – create Razorpay order
 */
router.post("/upgrade", auth_1.requireAuth, (0, auth_1.requireRole)("teacher"), TeacherSubscriptionController_1.upgradeTeacherSubscription);
/**
 * Confirm payment & activate plan
 */
router.post("/confirm", auth_1.requireAuth, (0, auth_1.requireRole)("teacher"), TeacherSubscriptionController_1.confirmTeacherSubscription);
/**
 * @route   PATCH /api/teacher-plans/:id
 * @desc    Update teacher plan (price, duration, uploadLimit, active)
 * @access  Private/Admin
 */
router.patch("/plans/:id", auth_1.requireAdminAuth, TeacherSubscriptionController_1.updateTeacherPlan);
exports.default = router;
//# sourceMappingURL=teacherSubscription.js.map