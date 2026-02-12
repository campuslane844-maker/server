import axios from "axios";
/** ---------- One-time order ---------- */
interface CreateOrderOptions {
    amount: number;
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
    totalCount?: number;
    customerNotify?: boolean;
    startAt?: number;
}
interface CancelSubscriptionOptions {
    cancelAtCycleEnd?: boolean;
}
export declare const razorpayHttp: axios.AxiosInstance;
/** ---------- Create Razorpay Order ---------- */
export declare function createOrder(options: CreateOrderOptions): Promise<import("razorpay/dist/types/orders").Orders.RazorpayOrder>;
/** ---------- Verify Razorpay Payment Signature ---------- */
export declare function verifySignature(params: VerifySignatureParams): boolean;
/**
 * Create Razorpay Subscription
 * This only creates subscription object — payment happens via Checkout
 */
export declare function createSubscription(options: CreateSubscriptionOptions): Promise<import("razorpay/dist/types/subscriptions").Subscriptions.RazorpaySubscription>;
/**
 * Fetch subscription from Razorpay
 * Useful for admin / reconciliation
 */
export declare function fetchSubscription(subscriptionId: string): Promise<import("razorpay/dist/types/subscriptions").Subscriptions.RazorpaySubscription>;
/**
 * Cancel subscription
 * - cancel_at_cycle_end = true → recommended
 */
export declare function cancelSubscription(subscriptionId: string, options?: CancelSubscriptionOptions): Promise<import("razorpay/dist/types/subscriptions").Subscriptions.RazorpaySubscription>;
/**
 * Verify Razorpay webhook signature
 * MUST be used before processing events
 */
export declare function verifyWebhookSignature(rawBody: Buffer, razorpaySignature: string): boolean;
/**
 * Create Razorpay Contact (required for payouts)
 */
export declare function createRazorpayContact({ name, email, contact, referenceId, }: {
    name: string;
    email: string;
    contact?: string;
    referenceId: string;
}): Promise<any>;
/**
 * Create UPI Fund Account
 */
export declare function createUpiFundAccount({ contactId, upiId, }: {
    contactId: string;
    upiId: string;
}): Promise<any>;
/**
 * Extract common subscription entity safely
 */
export declare function extractSubscriptionEntity(webhookBody: any): any;
/**
 * Convert Razorpay UNIX timestamp → JS Date
 */
export declare function razorpayTimestampToDate(ts?: number): Date | undefined;
declare const _default: {
    createOrder: typeof createOrder;
    verifySignature: typeof verifySignature;
    createSubscription: typeof createSubscription;
    fetchSubscription: typeof fetchSubscription;
    cancelSubscription: typeof cancelSubscription;
    verifyWebhookSignature: typeof verifyWebhookSignature;
    createRazorpayContact: typeof createRazorpayContact;
    createUpiFundAccount: typeof createUpiFundAccount;
    extractSubscriptionEntity: typeof extractSubscriptionEntity;
    razorpayTimestampToDate: typeof razorpayTimestampToDate;
};
export default _default;
//# sourceMappingURL=PaymentService.d.ts.map