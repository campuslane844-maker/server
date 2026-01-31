import { ContentView } from "../models/ContentView";
import { TeacherEarning } from "../models/TeacherEarning";
import { PlatformConfig } from "../models/PlatformConfig";
import { TeacherPayoutProfile } from "../models/TeacherPayoutProfile";
import cron from "node-cron";
import { razorpayHttp } from "./PaymentService";

export async function aggregateTeacherEarnings(month: string) {
  const [year, mon] = month.split("-").map(Number);

  const start = new Date(year, mon - 1, 1);
  const end = new Date(year, mon, 1);

  const config = await PlatformConfig.findOne();
  if (!config) throw new Error("Pay per view not configured");

  const rate = config.payPerView;

  const rows = await ContentView.aggregate([
    { $match: { viewedAt: { $gte: start, $lt: end } } },

    {
      $lookup: {
        from: "contents",
        localField: "contentId",
        foreignField: "_id",
        as: "content",
      },
    },
    { $unwind: "$content" },

    {
      $match: {
        "content.uploaderRole": "teacher",
      },
    },

    {
      $group: {
        _id: "$content.uploaderId",
        views: { $sum: 1 },
      },
    },
  ]);

  for (const row of rows) {
    const views = row.views;
    const amount = Number((views * rate).toFixed(2));

    await TeacherEarning.updateOne(
      {
        teacherId: row._id,
        month,
      },
      {
        $setOnInsert: {
          teacherId: row._id,
          month,
          views,
          ratePerView: rate,
          grossAmount: amount,
          paid: false,
        },
      },
      { upsert: true }
    );
  }
}


export async function payTeachersForMonth(month: string) {
  const earnings = await TeacherEarning.find({
    month,
    paid: false,
    grossAmount: { $gt: 0 },
  });

  for (const earning of earnings) {
    const profile = await TeacherPayoutProfile.findOne({
      teacherId: earning.teacherId,
      active: true,
    });

    if (!profile) continue;

    const payout = await razorpayHttp.post("/payouts", {
      account_number: process.env.RAZORPAY_MERCHANT_ACCOUNT,
      fund_account_id: profile.fundAccountId,
      amount: Math.round(earning.grossAmount * 100), // paise
      currency: "INR",
      mode: "UPI", 
      purpose: "payout",
      reference_id: `${earning._id}_${Date.now()}`,
      queue_if_low_balance: true,
    });

    await TeacherEarning.updateOne(
      { _id: earning._id },
      {
        paid: true,
        razorpayPayoutId: payout.data.id,
      }
    );
  }
}

cron.schedule("59 23 28-31 * *", async () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // run ONLY if today is last day
  if (tomorrow.getDate() !== 1) return;

  const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}`;

  await aggregateTeacherEarnings(month);
  await payTeachersForMonth(month);
});
