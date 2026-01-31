import { Request, Response } from "express";
import PaymentService from "../services/PaymentService";
import { StudentSubscription } from "../models/StudentSubscription";

export async function razorpayWebhookHandler(
  req: Request,
  res: Response
) {
  console.log("🔥🔥🔥 WEBHOOK HIT 🔥🔥🔥");

  const signature = req.headers["x-razorpay-signature"] as string;
  const rawBody = req.body as Buffer;

  // 1️⃣ Verify signature using RAW BUFFER
  const isValid = PaymentService.verifyWebhookSignature(
    rawBody,
    signature
  );

  if (!isValid) {
    console.error("❌ Invalid webhook signature");
    return res.status(400).send("Invalid signature");
  }

  // 2️⃣ Parse JSON ONLY after verification
  const payload = JSON.parse(rawBody.toString());
  const event = payload.event;

  const subscriptionEntity =
    PaymentService.extractSubscriptionEntity(payload);

  console.log("✅ Webhook received:", event);
  console.log("Subscription ID:", subscriptionEntity?.id);

  if (!subscriptionEntity) {
    return res.json({ ok: true });
  }

  // 3️⃣ Find subscription in DB
  const subscription = await StudentSubscription.findOne({
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
      subscription.currentStart = new Date(
        subscriptionEntity.current_start * 1000
      );
      subscription.currentEnd = new Date(
        subscriptionEntity.current_end * 1000
      );
      break;

    case "subscription.charged":
      subscription.currentStart = new Date(
        subscriptionEntity.current_start * 1000
      );
      subscription.currentEnd = new Date(
        subscriptionEntity.current_end * 1000
      );
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
