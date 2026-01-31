"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createPaymentOrder = exports.verifyPaymentValidation = exports.createOrderValidation = void 0;
const express_validator_1 = require("express-validator");
const Order_1 = require("../models/Order");
const asyncHandler_1 = require("../utils/asyncHandler");
const PaymentService_1 = require("../services/PaymentService");
const Cart_1 = require("../models/Cart");
const Product_1 = require("../models/Product");
/** ---------- Validation Rules ---------- */
exports.createOrderValidation = [
    (0, express_validator_1.body)("orderId").isMongoId().withMessage("Valid order ID is required"),
];
exports.verifyPaymentValidation = [
    (0, express_validator_1.body)("razorpay_order_id")
        .notEmpty()
        .withMessage("Razorpay order ID is required"),
    (0, express_validator_1.body)("razorpay_payment_id")
        .notEmpty()
        .withMessage("Razorpay payment ID is required"),
    (0, express_validator_1.body)("razorpay_signature")
        .notEmpty()
        .withMessage("Razorpay signature is required"),
];
/** ---------- Create Razorpay Payment Order ---------- */
// @desc    Create Razorpay order
// @route   POST /api/payment/order
// @access  Private
exports.createPaymentOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array(),
        });
    }
    const { orderId } = req.body;
    const userId = req.user?._id;
    if (!userId) {
        return res
            .status(401)
            .json({ success: false, message: "Unauthorized: Missing user" });
    }
    // Find order
    const order = await Order_1.Order.findOne({ _id: orderId, userId });
    if (!order) {
        return res.status(404).json({
            success: false,
            message: "Order not found",
        });
    }
    if (order.paymentStatus === "paid") {
        return res.status(400).json({
            success: false,
            message: "Order is already paid",
        });
    }
    try {
        // Create Razorpay order
        const razorpayOrder = await (0, PaymentService_1.createOrder)({
            amount: order.totalAmount,
            currency: "INR",
            receipt: `order_${order._id}`,
        });
        // Save Razorpay order ID
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();
        return res.status(200).json({
            success: true,
            data: {
                razorpayOrderId: razorpayOrder.id,
                currency: razorpayOrder.currency,
                amount: razorpayOrder.amount,
                orderId: order._id,
                key: process.env.RAZORPAY_KEY_ID,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create Razorpay order",
        });
    }
});
/** ---------- Verify Razorpay Payment ---------- */
// @desc    Verify payment signature
// @route   POST /api/payment/verify
// @access  Private
exports.verifyPayment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array(),
        });
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user?._id;
    if (!userId) {
        return res
            .status(401)
            .json({ success: false, message: "Unauthorized: Missing user" });
    }
    try {
        // Find order by Razorpay order ID
        const order = await Order_1.Order.findOne({
            razorpayOrderId: razorpay_order_id,
            userId,
        });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }
        // Verify Razorpay signature
        const isValidSignature = (0, PaymentService_1.verifySignature)({
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id,
            signature: razorpay_signature,
        });
        if (!isValidSignature) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature",
            });
        }
        // Reduce stock
        for (const item of order.items) {
            const variant = await Product_1.Variant.findById(item.variantId);
            if (!variant || variant.stock < item.quantity) {
                throw new Error("Stock issue during payment");
            }
            variant.stock -= item.quantity;
            await variant.save();
        }
        // Update order status
        order.paymentStatus = "paid";
        order.razorpayPaymentId = razorpay_payment_id;
        order.status = "confirmed";
        await order.save();
        // Clear user's cart
        await Cart_1.Cart.findOneAndDelete({ userId });
        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: {
                orderId: order._id,
                paymentStatus: order.paymentStatus,
                razorpayPaymentId: razorpay_payment_id,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Error verifying payment",
        });
    }
});
/** ---------- Exports ---------- */
exports.default = {
    createPaymentOrder: [exports.createOrderValidation, exports.createPaymentOrder],
    verifyPayment: [exports.verifyPaymentValidation, exports.verifyPayment],
};
//# sourceMappingURL=PaymentController.js.map