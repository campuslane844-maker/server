import { Request, Response } from "express";
import { TeacherPlan } from "../models/TeacherPlan";
import { AuthenticatedRequest } from "../middleware/auth";
import { TeacherSubscription } from "../models/TeacherSubscription";
import PaymentService from "../services/PaymentService";
import { TeacherSubscriptionOrder } from "../models/TeacherSubscriptionOrder";
import { User } from "../models/User";


export async function getTeacherPlans(_req: Request, res: Response) {
  try {
    const plans = await TeacherPlan.find({
      isActive: true,
    }).sort({ price: 1 });

    res.json({ plans });
  } catch (err) {
    console.error("Get teacher plans error:", err);
    res.status(500).json({ message: "Failed to fetch plans" });
  }
}

export async function getMyTeacherSubscription(
  req: Request,
  res: Response
) {
  try {
    const teacherId = (req as AuthenticatedRequest).user.userId;
    const now = new Date();
    console.log((req as AuthenticatedRequest).user)

    /**
     * Try PAID subscription first (active or expired)
     */
    let paidSub = await TeacherSubscription.findOne({
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
      const uploadsExhausted =
        paidSub.uploadLimit !== null &&
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
      const isSubscribed =
        paidSub.status === "active" &&
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
    const freeSub = await TeacherSubscription.findOne({
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

    const freeUploadsExhausted =
      freeSub.uploadLimit !== null &&
      freeSub.uploadsUsed >= freeSub.uploadLimit;

    res.json({
      isSubscribed: !freeUploadsExhausted,
      subscription: freeUploadsExhausted ? null : freeSub,
    });
    return;
  } catch (err) {
    console.error("Get teacher subscription error:", err);
    res.status(500).json({ message: "Failed to fetch subscription" });
  }
}


export async function upgradeTeacherSubscription(
  req: Request,
  res: Response
) {
  try {
    const teacherId = (req as AuthenticatedRequest).user._id;
    const { planId } = req.body;

    const plan = await TeacherPlan.findById(planId);
    if (!plan || !plan.isActive || plan.isFree) {
      res.status(400).json({ message: "Invalid plan selected" });
      return;
    }

    const order = await PaymentService.createOrder({
      amount: plan.price,
      receipt: `${teacherId}_${Date.now()}`,
    });

    await TeacherSubscriptionOrder.create({
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
  } catch (err) {
    console.error("Upgrade teacher subscription error:", err);
    res.status(500).json({ message: "Failed to initiate upgrade" });
  }
}


export async function confirmTeacherSubscription(
  req: Request,
  res: Response
) {
  try {
    const teacherId = (req as AuthenticatedRequest).user._id;

    const {
      planId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const order = await TeacherSubscriptionOrder.findOne({
      razorpayOrderId: razorpay_order_id,
      teacherId,
      status: "created",
    });

    if (!order || order.planId.toString() !== planId) {
      res.status(400).json({ message: "Invalid or used order" });
      return;
    }

    const isValid = PaymentService.verifySignature({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      res.status(400).json({ message: "Payment verification failed" });
      return;
    }

    const plan = await TeacherPlan.findById(planId);
    if (!plan) {
      res.status(400).json({ message: "Plan not found" });
      return;
    }

    // Expire existing subscription
    await TeacherSubscription.updateMany(
      { teacherId, status: "active" },
      { status: "expired" }
    );

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const subscription = await TeacherSubscription.create({
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
  } catch (err) {
    console.error("Confirm teacher subscription error:", err);
    res.status(500).json({ message: "Failed to activate subscription" });
  }
}

export async function assertTeacherCanUpload(teacherId: string) {
  const now = new Date();

  const teacher = await User.findById(teacherId) as any;
  console.log(teacher)

  if(teacher && teacher.approvalStatus != "approved") {
    throw new Error("Not yet approved by Campuslane. Your profile is under review.")
  }

  /**
   * Try ACTIVE PAID subscription first
   */
  const paidSub = await TeacherSubscription.findOne({
    teacherId,
    status: "active",
    isFree: false,
  });

  if (paidSub) {
    // Time expiry
    if (now > paidSub.endDate) {
      paidSub.status = "expired";
      await paidSub.save();
    } else {
      // Upload limit check
      if (
        paidSub.uploadLimit === null ||
        paidSub.uploadsUsed < paidSub.uploadLimit
      ) {
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
  const freeSub = await TeacherSubscription.findOne({
    teacherId,
    isFree: true,
  });

  if (!freeSub) {
    throw new Error("Free plan not found");
  }

  if (
    freeSub.uploadLimit !== null &&
    freeSub.uploadsUsed >= freeSub.uploadLimit
  ) {
    throw new Error("Upload limit reached");
  }

  return freeSub; // fallback works
}


// @desc    Update teacher plan (one-time purchase)
// @route   PATCH /admin/teacher-plans/:id
// @access  Private/Admin
export async function updateTeacherPlan(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    
    const { id } = req.params;
    const {
      name,
      price,
      durationDays,
      uploadLimit,
      isActive,
    } = req.body;

    const plan = await TeacherPlan.findById(id);
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
    if (name !== undefined) plan.name = name;
    if (price !== undefined) plan.price = price;
    if (durationDays !== undefined) plan.durationDays = durationDays;
    if (uploadLimit !== undefined) plan.uploadLimit = uploadLimit;
    if (isActive !== undefined) plan.isActive = isActive;

    await plan.save();

    res.json({
      success: true,
      plan,
    });
    return;
  } catch (err) {
    console.error("Update teacher plan error:", err);
    res.status(500).json({ message: "Failed to update teacher plan" });
  }
}
