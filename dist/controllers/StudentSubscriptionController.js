"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStudentSubscription = createStudentSubscription;
exports.getMySubscription = getMySubscription;
exports.cancelMySubscription = cancelMySubscription;
const PaymentService_1 = __importDefault(require("../services/PaymentService"));
const StudentSubscription_1 = require("../models/StudentSubscription");
const razorpay_1 = __importDefault(require("razorpay"));
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
/**
 * POST /api/student-subscription/create
 * Create Razorpay subscription
 */
async function createStudentSubscription(req, res) {
    try {
        const { plan } = req.body;
        const studentId = req.user._id;
        if (!["monthly", "yearly"].includes(plan)) {
            res.status(400).json({ message: "Invalid plan" });
            return;
        }
        // Prevent duplicate active subscriptions
        const activeSubscription = await StudentSubscription_1.StudentSubscription.findOne({
            studentId,
            status: "active",
        });
        if (activeSubscription) {
            res.status(400).json({
                message: "You already have an active subscription",
            });
            return;
        }
        const subscription = await PaymentService_1.default.createSubscription({
            plan,
        });
        await StudentSubscription_1.StudentSubscription.create({
            studentId,
            plan,
            razorpaySubscriptionId: subscription.id,
            razorpayPlanId: subscription.plan_id,
            status: subscription.status,
        });
        res.json({
            subscriptionId: subscription.id,
        });
    }
    catch (error) {
        console.error("Create subscription error:", error);
        res.status(500).json({
            message: "Failed to create subscription",
        });
    }
}
/**
 * GET /api/student-subscription/me
 * Get logged-in student's subscription status
 */
async function getMySubscription(req, res) {
    try {
        const studentId = req.user._id;
        let subscription = await StudentSubscription_1.StudentSubscription.findOne({
            studentId,
            currentEnd: { $gte: new Date() },
        });
        if (!subscription) {
            res.json({
                isSubscribed: false,
                subscription: null,
            });
            return;
        }
        /**
         * Reconcile with Razorpay (safety net)
         * Only if subscription is not expired
         */
        if (subscription.razorpaySubscriptionId) {
            const razorpaySub = await razorpay.subscriptions.fetch(subscription.razorpaySubscriptionId);
            // Cancelled at period end
            if (razorpaySub.status === "cancelled" &&
                subscription.status !== "cancelled") {
                subscription.status = "cancelled";
                await subscription.save();
            }
            // Fully completed (expired)
            if (razorpaySub.status === "completed" &&
                subscription.status !== "expired") {
                subscription.status = "expired";
                await subscription.save();
            }
        }
        const hasAccess = subscription.status === "active" ||
            subscription.status === "cancelled";
        res.json({
            isSubscribed: hasAccess,
            subscription,
        });
    }
    catch (error) {
        console.error("Get subscription error:", error);
        res.status(500).json({
            message: "Failed to fetch subscription",
        });
    }
}
/**
 * POST /api/student-subscription/cancel
 * Cancel subscription at cycle end
 */
async function cancelMySubscription(req, res) {
    try {
        const studentId = req.user._id;
        const subscription = await StudentSubscription_1.StudentSubscription.findOne({
            studentId,
            status: "active",
        });
        if (!subscription) {
            res.status(404).json({
                message: "No active subscription found",
            });
            return;
        }
        await PaymentService_1.default.cancelSubscription(subscription.razorpaySubscriptionId, { cancelAtCycleEnd: true });
        subscription.status = "cancelled";
        subscription.cancelAtCycleEnd = true;
        await subscription.save();
        res.json({
            message: "Subscription will be cancelled at end of billing cycle",
        });
    }
    catch (error) {
        console.error("Cancel subscription error:", error);
        res.status(500).json({
            message: "Failed to cancel subscription",
        });
    }
}
//# sourceMappingURL=StudentSubscriptionController.js.map