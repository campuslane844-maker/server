import { Router } from "express";
import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/PaymentController";
import { requireAuth } from "../middleware/auth"; // Ensure this middleware sets req.user

const router = Router();

/**
 * @route   POST /api/payment/order
 * @desc    Create Razorpay order
 * @access  Private (requires authentication)
 */
router.post(
  "/order",
  requireAuth,
  createPaymentOrder
);

/**
 * @route   POST /api/payment/verify
 * @desc    Verify Razorpay payment signature
 * @access  Private (requires authentication)
 */
router.post(
  "/verify",
  requireAuth,
  verifyPayment
);

export default router;
