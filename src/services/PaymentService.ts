import Razorpay from "razorpay";
import crypto from "crypto";
import axios from "axios";

/* =========================================================
   TYPES
========================================================= */

/** ---------- One-time order ---------- */
interface CreateOrderOptions {
  amount: number; // in rupees
  currency?: string;
  receipt?: string;
}

/** ---------- Verify payment ---------- */
interface VerifySignatureParams {
  order_id: string;
  payment_id: string;
  signature: string;
}

/** ---------- Subscription ---------- */
export type SubscriptionPlan = "monthly" | "yearly";

interface CreateSubscriptionOptions {
  plan: SubscriptionPlan;
  totalCount?: number; // billing cycles (optional)
  customerNotify?: boolean;
  startAt?: number; // unix timestamp (optional)
}

interface CancelSubscriptionOptions {
  cancelAtCycleEnd?: boolean;
}

/* =========================================================
   RAZORPAY CLIENT
========================================================= */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export const razorpayHttp = axios.create({
  baseURL: "https://api.razorpay.com/v1",
  auth: {
    username: process.env.RAZORPAY_KEY_ID!,
    password: process.env.RAZORPAY_KEY_SECRET!,
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
const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, string> = {
  monthly: process.env.RAZORPAY_MONTHLY_PLAN_ID as string,
  yearly: process.env.RAZORPAY_YEARLY_PLAN_ID as string,
};

/* =========================================================
   ONE-TIME PAYMENT (ECOMMERCE)
========================================================= */

/** ---------- Create Razorpay Order ---------- */
export async function createOrder(options: CreateOrderOptions) {
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
export function verifySignature(params: VerifySignatureParams): boolean {
  const { order_id, payment_id, signature } = params;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
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
export async function createSubscription(options: CreateSubscriptionOptions) {
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
export async function fetchSubscription(subscriptionId: string) {
  return razorpay.subscriptions.fetch(subscriptionId);
}

/**
 * Cancel subscription
 * - cancel_at_cycle_end = true → recommended
 */
export async function cancelSubscription(
  subscriptionId: string,
  options: CancelSubscriptionOptions = {}
) {
  const { cancelAtCycleEnd = true } = options;

  return razorpay.subscriptions.cancel(
    subscriptionId,
    cancelAtCycleEnd ? 1 : 0
  );
}

/* =========================================================
   WEBHOOK VERIFICATION
========================================================= */

/**
 * Verify Razorpay webhook signature
 * MUST be used before processing events
 */
export function verifyWebhookSignature(
  rawBody: Buffer,
  razorpaySignature: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET as string)
    .update(rawBody)
    .digest("hex");

  return expectedSignature === razorpaySignature;
}


/**
 * Create Razorpay Contact (required for payouts)
 */
export async function createRazorpayContact({
  name,
  email,
  contact,
  referenceId,
}: {
  name: string;
  email: string;
  contact?: string;
  referenceId: string;
}) {
  const response = await razorpayHttp.post("/contacts", {
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
export async function createUpiFundAccount({
  contactId,
  upiId,
}: {
  contactId: string;
  upiId: string;
}) {
  const response = await razorpayHttp.post("/fund_accounts", {
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
export function extractSubscriptionEntity(webhookBody: any) {
  return webhookBody?.payload?.subscription?.entity || null;
}

/**
 * Convert Razorpay UNIX timestamp → JS Date
 */
export function razorpayTimestampToDate(ts?: number) {
  return ts ? new Date(ts * 1000) : undefined;
}

/* =========================================================
   EXPORTS
========================================================= */

export default {
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
