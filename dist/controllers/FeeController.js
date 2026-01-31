"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFeeConfig = exports.getFeeConfig = exports.getFeeHistory = exports.verifyFeePayment = exports.createFeeOrder = void 0;
const FeePayment_1 = require("../models/FeePayment");
const PaymentService_1 = require("../services/PaymentService");
const FeeConfig_1 = require("../models/FeeConfig");
/**
 * -----------------------------
 * Create Razorpay Order
 * -----------------------------
 */
const createFeeOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, className, schoolName, phone, street, city, state, pin, } = req.body;
        if (!name || !className || !phone) {
            res.status(400).json({
                message: "Student name, class and phone are required",
            });
            return;
        }
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const feeConfig = await FeeConfig_1.FeeConfig.findById("6962def465497ff4352e7ffd");
        // Block duplicate payment
        const alreadyPaid = await FeePayment_1.FeePayment.findOne({
            userId,
            month,
            year,
            status: "Paid",
        });
        if (alreadyPaid) {
            res.status(400).json({
                message: "Fee already paid for this month",
            });
            return;
        }
        const order = await (0, PaymentService_1.createOrder)({
            amount: feeConfig?.amount,
            receipt: `fee_${userId}_${month}_${year}`,
        });
        await FeePayment_1.FeePayment.findOneAndUpdate({ userId, month, year }, {
            userId,
            month,
            year,
            amount: feeConfig?.amount,
            status: "Pending",
            razorpayOrderId: order.id,
            studentInfo: {
                name,
                className,
                schoolName,
                phone,
                address: {
                    street,
                    city,
                    state,
                    pin,
                },
            },
        }, { upsert: true });
        res.json({
            orderId: order.id,
            amount: feeConfig?.amount,
        });
    }
    catch (error) {
        console.error("Create Fee Order Error:", error);
        res.status(500).json({ message: "Failed to create fee order" });
    }
};
exports.createFeeOrder = createFeeOrder;
/**
 * -----------------------------
 * Verify Razorpay Payment
 * -----------------------------
 */
const verifyFeePayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, } = req.body;
        const valid = (0, PaymentService_1.verifySignature)({
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id,
            signature: razorpay_signature,
        });
        if (!valid) {
            res.status(400).json({ message: "Invalid payment signature" });
            return;
        }
        const payment = await FeePayment_1.FeePayment.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, {
            status: "Paid",
            razorpayPaymentId: razorpay_payment_id,
            paidAt: new Date(),
        }, { new: true });
        if (!payment) {
            res.status(404).json({
                message: "Payment record not found",
            });
            return;
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error("Verify Fee Payment Error:", error);
        res.status(500).json({ message: "Payment verification failed" });
    }
};
exports.verifyFeePayment = verifyFeePayment;
/**
 * -----------------------------
 * Fee History (UI-ready)
 * -----------------------------
 */
const getFeeHistory = async (req, res) => {
    try {
        const payments = await FeePayment_1.FeePayment.find({
            userId: req.user._id,
        }).sort({ year: -1, month: -1 });
        const formatted = payments.map((p) => {
            const monthLabel = new Date(p.year, p.month - 1).toLocaleString("default", { month: "long", year: "numeric" });
            return {
                month: monthLabel,
                amount: p.amount,
                status: p.status,
                date: p.paidAt
                    ? p.paidAt.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })
                    : "-",
            };
        });
        res.json(formatted);
    }
    catch (error) {
        console.error("Get Fee History Error:", error);
        res.status(500).json({ message: "Failed to fetch fee history" });
    }
};
exports.getFeeHistory = getFeeHistory;
const getFeeConfig = async (_req, res) => {
    try {
        const config = await FeeConfig_1.FeeConfig.findOne().sort({ createdAt: -1 });
        if (!config) {
            res.status(404).json({ message: "Fee configuration not found" });
            return;
        }
        res.json({
            amount: config.amount,
            currency: config.currency,
            updatedAt: config.updatedAt,
        });
    }
    catch (error) {
        console.error("Get Fee Config Error:", error);
        res.status(500).json({ message: "Failed to fetch fee config" });
    }
};
exports.getFeeConfig = getFeeConfig;
const updateFeeConfig = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            res.status(400).json({ message: "Valid amount is required" });
            return;
        }
        const updated = await FeeConfig_1.FeeConfig.findOneAndUpdate({}, { amount }, {
            new: true,
            upsert: true, // ensures config always exists
        });
        res.json({
            success: true,
            message: "Fee amount updated successfully",
            data: {
                amount: updated.amount,
                currency: updated.currency,
                updatedAt: updated.updatedAt,
            },
        });
    }
    catch (error) {
        console.error("Update Fee Config Error:", error);
        res.status(500).json({ message: "Failed to update fee config" });
    }
};
exports.updateFeeConfig = updateFeeConfig;
//# sourceMappingURL=FeeController.js.map