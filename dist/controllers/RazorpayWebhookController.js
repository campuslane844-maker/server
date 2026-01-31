"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.razorpayWebhookHandler = razorpayWebhookHandler;
const PaymentService_1 = __importDefault(require("../services/PaymentService"));
const StudentSubscription_1 = require("../models/StudentSubscription");
async function razorpayWebhookHandler(req, res) {
    console.log("🔥🔥🔥 WEBHOOK HIT 🔥🔥🔥");
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.body;
    // 1️⃣ Verify signature using RAW BUFFER
    const isValid = PaymentService_1.default.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
        console.error("❌ Invalid webhook signature");
        return res.status(400).send("Invalid signature");
    }
    // 2️⃣ Parse JSON ONLY after verification
    const payload = JSON.parse(rawBody.toString());
    const event = payload.event;
    const subscriptionEntity = PaymentService_1.default.extractSubscriptionEntity(payload);
    console.log("✅ Webhook received:", event);
    console.log("Subscription ID:", subscriptionEntity?.id);
    if (!subscriptionEntity) {
        return res.json({ ok: true });
    }
    // 3️⃣ Find subscription in DB
    const subscription = await StudentSubscription_1.StudentSubscription.findOne({
        razorpaySubscriptionId: subscriptionEntity.id,
    });
    if (!subscription) {
        console.warn("Subscription not found in DB");
        return res.json({ ok: true });
    }
    // 4️⃣ Handle events
    switch (event) {
        case "subscription.activated":
            subscription.status = "active";
            subscription.currentStart = new Date(subscriptionEntity.current_start * 1000);
            subscription.currentEnd = new Date(subscriptionEntity.current_end * 1000);
            break;
        case "subscription.charged":
            subscription.currentStart = new Date(subscriptionEntity.current_start * 1000);
            subscription.currentEnd = new Date(subscriptionEntity.current_end * 1000);
            break;
        case "subscription.cancelled":
            subscription.status = "cancelled";
            break;
        case "subscription.completed":
            subscription.status = "expired";
            break;
    }
    await subscription.save();
    return res.json({ ok: true });
}
//# sourceMappingURL=RazorpayWebhookController.js.map