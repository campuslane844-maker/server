"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeacherPlans = getTeacherPlans;
exports.getMyTeacherSubscription = getMyTeacherSubscription;
exports.upgradeTeacherSubscription = upgradeTeacherSubscription;
exports.confirmTeacherSubscription = confirmTeacherSubscription;
exports.assertTeacherCanUpload = assertTeacherCanUpload;
exports.updateTeacherPlan = updateTeacherPlan;
const TeacherPlan_1 = require("../models/TeacherPlan");
const TeacherSubscription_1 = require("../models/TeacherSubscription");
const PaymentService_1 = __importDefault(require("../services/PaymentService"));
const TeacherSubscriptionOrder_1 = require("../models/TeacherSubscriptionOrder");
const User_1 = require("../models/User");
async function getTeacherPlans(_req, res) {
    try {
        const plans = await TeacherPlan_1.TeacherPlan.find({
            isActive: true,
        }).sort({ price: 1 });
        res.json({ plans });
    }
    catch (err) {
        console.error("Get teacher plans error:", err);
        res.status(500).json({ message: "Failed to fetch plans" });
    }
}
async function getMyTeacherSubscription(req, res) {
    try {
        const teacherId = req.user.userId;
        const now = new Date();
        console.log(req.user);
        /**
         * Try PAID subscription first (active or expired)
         */
        let paidSub = await TeacherSubscription_1.TeacherSubscription.findOne({
            teacherId,
            isFree: false,
        }).populate("planId");
        if (paidSub) {
            const isTimeExpired = now > paidSub.endDate;
            // Auto-expire if time crossed
            if (isTimeExpired && paidSub.status !== "expired") {
                paidSub.status = "expired";
                await paidSub.save();
            }
            // Upload exhaustion → mark expired
            const uploadsExhausted = paidSub.uploadLimit !== null &&
                paidSub.uploadsUsed >= paidSub.uploadLimit;
            if (uploadsExhausted && paidSub.status !== "expired") {
                paidSub.status = "expired";
                await paidSub.save();
            }
            /**
             * CORE LOGIC
             * Active + valid → subscribed
             * Expired (but endDate still future) → NOT subscribed but SEND subscription
             */
            const isSubscribed = paidSub.status === "active" &&
                !isTimeExpired &&
                !uploadsExhausted;
            res.json({
                isSubscribed,
                subscription: paidSub,
            });
            return;
        }
        /**
         * Fall back to FREE plan
         */
        const freeSub = await TeacherSubscription_1.TeacherSubscription.findOne({
            teacherId,
            isFree: true,
        }).populate("planId");
        if (!freeSub) {
            res.json({
                isSubscribed: false,
                subscription: null,
            });
            return;
        }
        const freeUploadsExhausted = freeSub.uploadLimit !== null &&
            freeSub.uploadsUsed >= freeSub.uploadLimit;
        res.json({
            isSubscribed: !freeUploadsExhausted,
            subscription: freeUploadsExhausted ? null : freeSub,
        });
        return;
    }
    catch (err) {
        console.error("Get teacher subscription error:", err);
        res.status(500).json({ message: "Failed to fetch subscription" });
    }
}
async function upgradeTeacherSubscription(req, res) {
    try {
        const teacherId = req.user._id;
        const { planId } = req.body;
        const plan = await TeacherPlan_1.TeacherPlan.findById(planId);
        if (!plan || !plan.isActive || plan.isFree) {
            res.status(400).json({ message: "Invalid plan selected" });
            return;
        }
        const order = await PaymentService_1.default.createOrder({
            amount: plan.price,
            receipt: `${teacherId}_${Date.now()}`,
        });
        await TeacherSubscriptionOrder_1.TeacherSubscriptionOrder.create({
            teacherId,
            planId: plan._id,
            razorpayOrderId: order.id,
            amount: plan.price,
        });
        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            planId: plan._id,
        });
    }
    catch (err) {
        console.error("Upgrade teacher subscription error:", err);
        res.status(500).json({ message: "Failed to initiate upgrade" });
    }
}
async function confirmTeacherSubscription(req, res) {
    try {
        const teacherId = req.user._id;
        const { planId, razorpay_order_id, razorpay_payment_id, razorpay_signature, } = req.body;
        const order = await TeacherSubscriptionOrder_1.TeacherSubscriptionOrder.findOne({
            razorpayOrderId: razorpay_order_id,
            teacherId,
            status: "created",
        });
        if (!order || order.planId.toString() !== planId) {
            res.status(400).json({ message: "Invalid or used order" });
            return;
        }
        const isValid = PaymentService_1.default.verifySignature({
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id,
            signature: razorpay_signature,
        });
        if (!isValid) {
            res.status(400).json({ message: "Payment verification failed" });
            return;
        }
        const plan = await TeacherPlan_1.TeacherPlan.findById(planId);
        if (!plan) {
            res.status(400).json({ message: "Plan not found" });
            return;
        }
        // Expire existing subscription
        await TeacherSubscription_1.TeacherSubscription.updateMany({ teacherId, status: "active" }, { status: "expired" });
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.durationDays);
        const subscription = await TeacherSubscription_1.TeacherSubscription.create({
            teacherId,
            planId: plan._id,
            planCode: plan.code,
            uploadLimit: plan.uploadLimit,
            uploadsUsed: 0,
            startDate,
            endDate,
            razorpayPaymentId: razorpay_payment_id,
            status: "active",
        });
        order.status = "paid";
        await order.save();
        res.json({ subscription });
    }
    catch (err) {
        console.error("Confirm teacher subscription error:", err);
        res.status(500).json({ message: "Failed to activate subscription" });
    }
}
async function assertTeacherCanUpload(teacherId) {
    const now = new Date();
    const teacher = await User_1.User.findById(teacherId);
    console.log(teacher);
    if (teacher && teacher.approvalStatus != "approved") {
        throw new Error("Not yet approved by Campuslane. Your profile is under review.");
    }
    /**
     * Try ACTIVE PAID subscription first
     */
    const paidSub = await TeacherSubscription_1.TeacherSubscription.findOne({
        teacherId,
        status: "active",
        isFree: false,
    });
    if (paidSub) {
        // Time expiry
        if (now > paidSub.endDate) {
            paidSub.status = "expired";
            await paidSub.save();
        }
        else {
            // Upload limit check
            if (paidSub.uploadLimit === null ||
                paidSub.uploadsUsed < paidSub.uploadLimit) {
                return paidSub; // ✅ use paid plan
            }
            // Uploads exhausted
            paidSub.status = "expired";
            await paidSub.save();
        }
    }
    /**
     * Fall back to FREE plan (never expires)
     */
    const freeSub = await TeacherSubscription_1.TeacherSubscription.findOne({
        teacherId,
        isFree: true,
    });
    if (!freeSub) {
        throw new Error("Free plan not found");
    }
    if (freeSub.uploadLimit !== null &&
        freeSub.uploadsUsed >= freeSub.uploadLimit) {
        throw new Error("Upload limit reached");
    }
    return freeSub; // fallback works
}
// @desc    Update teacher plan (one-time purchase)
// @route   PATCH /admin/teacher-plans/:id
// @access  Private/Admin
async function updateTeacherPlan(req, res) {
    try {
        const { id } = req.params;
        const { name, price, durationDays, uploadLimit, isActive, } = req.body;
        const plan = await TeacherPlan_1.TeacherPlan.findById(id);
        if (!plan) {
            res.status(404).json({ message: "Plan not found" });
            return;
        }
        // 🔐 Protect immutable fields
        if ("code" in req.body || "isFree" in req.body) {
            res.status(400).json({
                message: "code and isFree cannot be modified",
            });
            return;
        }
        // Apply updates (safe for one-time plans)
        if (name !== undefined)
            plan.name = name;
        if (price !== undefined)
            plan.price = price;
        if (durationDays !== undefined)
            plan.durationDays = durationDays;
        if (uploadLimit !== undefined)
            plan.uploadLimit = uploadLimit;
        if (isActive !== undefined)
            plan.isActive = isActive;
        await plan.save();
        res.json({
            success: true,
            plan,
        });
        return;
    }
    catch (err) {
        console.error("Update teacher plan error:", err);
        res.status(500).json({ message: "Failed to update teacher plan" });
    }
}
//# sourceMappingURL=TeacherSubscriptionController.js.map