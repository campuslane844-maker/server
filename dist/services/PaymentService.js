"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.razorpayHttp = void 0;
exports.createOrder = createOrder;
exports.verifySignature = verifySignature;
exports.createSubscription = createSubscription;
exports.fetchSubscription = fetchSubscription;
exports.cancelSubscription = cancelSubscription;
exports.verifyWebhookSignature = verifyWebhookSignature;
exports.createRazorpayContact = createRazorpayContact;
exports.createUpiFundAccount = createUpiFundAccount;
exports.extractSubscriptionEntity = extractSubscriptionEntity;
exports.razorpayTimestampToDate = razorpayTimestampToDate;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
/* =========================================================
   RAZORPAY CLIENT
========================================================= */
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
exports.razorpayHttp = axios_1.default.create({
    baseURL: "https://api.razorpay.com/v1",
    auth: {
        username: process.env.RAZORPAY_KEY_ID,
        password: process.env.RAZORPAY_KEY_SECRET,
    },
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});
/* =========================================================
   CONSTANTS
========================================================= */
/**
 * Razorpay Plan IDs (created in Razorpay dashboard)
 * These MUST exist
 */
const SUBSCRIPTION_PLANS = {
    monthly: process.env.RAZORPAY_MONTHLY_PLAN_ID,
    yearly: process.env.RAZORPAY_YEARLY_PLAN_ID,
};
/* =========================================================
   ONE-TIME PAYMENT (ECOMMERCE)
========================================================= */
/** ---------- Create Razorpay Order ---------- */
async function createOrder(options) {
    const { amount, currency = "INR", receipt } = options;
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay keys not configured");
    }
    const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // rupees → paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
    });
    return order;
}
/** ---------- Verify Razorpay Payment Signature ---------- */
function verifySignature(params) {
    const { order_id, payment_id, signature } = params;
    const generatedSignature = crypto_1.default
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${order_id}|${payment_id}`)
        .digest("hex");
    return generatedSignature === signature;
}
/* =========================================================
   SUBSCRIPTION (AUTO-RENEWAL)
========================================================= */
/**
 * Create Razorpay Subscription
 * This only creates subscription object — payment happens via Checkout
 */
async function createSubscription(options) {
    const { plan, customerNotify = true, startAt } = options;
    const planId = SUBSCRIPTION_PLANS[plan];
    if (!planId) {
        throw new Error(`Invalid subscription plan: ${plan}`);
    }
    const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: customerNotify ? 1 : 0,
        start_at: startAt,
        total_count: plan === "monthly" ? 120 : 10
    });
    return subscription;
}
/**
 * Fetch subscription from Razorpay
 * Useful for admin / reconciliation
 */
async function fetchSubscription(subscriptionId) {
    return razorpay.subscriptions.fetch(subscriptionId);
}
/**
 * Cancel subscription
 * - cancel_at_cycle_end = true → recommended
 */
async function cancelSubscription(subscriptionId, options = {}) {
    const { cancelAtCycleEnd = true } = options;
    return razorpay.subscriptions.cancel(subscriptionId, cancelAtCycleEnd ? 1 : 0);
}
/* =========================================================
   WEBHOOK VERIFICATION
========================================================= */
/**
 * Verify Razorpay webhook signature
 * MUST be used before processing events
 */
function verifyWebhookSignature(rawBody, razorpaySignature) {
    const expectedSignature = crypto_1.default
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");
    return expectedSignature === razorpaySignature;
}
/**
 * Create Razorpay Contact (required for payouts)
 */
async function createRazorpayContact({ name, email, contact, referenceId, }) {
    const response = await exports.razorpayHttp.post("/contacts", {
        name,
        email,
        contact,
        type: "vendor",
        reference_id: referenceId,
    });
    return response.data; // contains contact.id
}
/**
 * Create UPI Fund Account
 */
async function createUpiFundAccount({ contactId, upiId, }) {
    const response = await exports.razorpayHttp.post("/fund_accounts", {
        account_type: "vpa",
        contact_id: contactId,
        vpa: {
            address: upiId,
        },
    });
    return response.data; // contains fund_account.id
}
/* =========================================================
   HELPERS (OPTIONAL BUT USEFUL)
========================================================= */
/**
 * Extract common subscription entity safely
 */
function extractSubscriptionEntity(webhookBody) {
    return webhookBody?.payload?.subscription?.entity || null;
}
/**
 * Convert Razorpay UNIX timestamp → JS Date
 */
function razorpayTimestampToDate(ts) {
    return ts ? new Date(ts * 1000) : undefined;
}
/* =========================================================
   EXPORTS
========================================================= */
exports.default = {
    // One-time
    createOrder,
    verifySignature,
    // Subscription
    createSubscription,
    fetchSubscription,
    cancelSubscription,
    // Webhooks
    verifyWebhookSignature,
    // Payout
    createRazorpayContact,
    createUpiFundAccount,
    // Helpers
    extractSubscriptionEntity,
    razorpayTimestampToDate,
};
//# sourceMappingURL=PaymentService.js.map