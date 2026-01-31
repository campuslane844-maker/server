"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PaymentController_1 = require("../controllers/PaymentController");
const auth_1 = require("../middleware/auth"); // Ensure this middleware sets req.user
const router = (0, express_1.Router)();
/**
 * @route   POST /api/payment/order
 * @desc    Create Razorpay order
 * @access  Private (requires authentication)
 */
router.post("/order", auth_1.requireAuth, PaymentController_1.createPaymentOrder);
/**
 * @route   POST /api/payment/verify
 * @desc    Verify Razorpay payment signature
 * @access  Private (requires authentication)
 */
router.post("/verify", auth_1.requireAuth, PaymentController_1.verifyPayment);
exports.default = router;
//# sourceMappingURL=payment.js.map