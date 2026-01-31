import { Request, Response } from "express";
import PaymentService from "../services/PaymentService";
import { StudentSubscription } from "../models/StudentSubscription";
import { AuthenticatedRequest } from "../middleware/auth";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

/**
 * POST /api/student-subscription/create
 * Create Razorpay subscription
 */
export async function createStudentSubscription(req: Request, res: Response) {
  try {
    const { plan } = req.body; 
    const studentId = (req as AuthenticatedRequest).user._id;

    if (!["monthly", "yearly"].includes(plan)) {
      res.status(400).json({ message: "Invalid plan" });
      return;
    }

    // Prevent duplicate active subscriptions
    const activeSubscription = await StudentSubscription.findOne({
      studentId,
      status: "active",
    });

    if (activeSubscription) {
      res.status(400).json({
        message: "You already have an active subscription",
      });
      return;
    }

    const subscription = await PaymentService.createSubscription({
      plan,
    });

    await StudentSubscription.create({
      studentId,
      plan,
      razorpaySubscriptionId: subscription.id,
      razorpayPlanId: subscription.plan_id,
      status: subscription.status,
    });

    res.json({
      subscriptionId: subscription.id,
    });
  } catch (error) {
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
export async function getMySubscription(req: Request, res: Response) {
  try {
    const studentId = (req as AuthenticatedRequest).user._id;

    let subscription = await StudentSubscription.findOne({
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
      const razorpaySub = await razorpay.subscriptions.fetch(
        subscription.razorpaySubscriptionId
      );

      // Cancelled at period end
      if (
        razorpaySub.status === "cancelled" &&
        subscription.status !== "cancelled"
      ) {
        subscription.status = "cancelled";
        await subscription.save();
      }

      // Fully completed (expired)
      if (
        razorpaySub.status === "completed" &&
        subscription.status !== "expired"
      ) {
        subscription.status = "expired";
        await subscription.save();
      }
    }

    const hasAccess =
      subscription.status === "active" ||
      subscription.status === "cancelled";

    res.json({
      isSubscribed: hasAccess,
      subscription,
    });
  } catch (error) {
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
export async function cancelMySubscription(req: Request, res: Response) {
  try {
    const studentId = (req as AuthenticatedRequest).user._id;

    const subscription = await StudentSubscription.findOne({
      studentId,
      status: "active",
    });

    if (!subscription) {
      res.status(404).json({
        message: "No active subscription found",
      });
      return;
    }

    await PaymentService.cancelSubscription(
      subscription.razorpaySubscriptionId,
      { cancelAtCycleEnd: true }
    );

    subscription.status = "cancelled";
    subscription.cancelAtCycleEnd = true;
    await subscription.save();

    res.json({
      message: "Subscription will be cancelled at end of billing cycle",
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({
      message: "Failed to cancel subscription",
    });
  }
}
