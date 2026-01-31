"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateTeacherEarnings = aggregateTeacherEarnings;
exports.payTeachersForMonth = payTeachersForMonth;
const ContentView_1 = require("../models/ContentView");
const TeacherEarning_1 = require("../models/TeacherEarning");
const PlatformConfig_1 = require("../models/PlatformConfig");
const TeacherPayoutProfile_1 = require("../models/TeacherPayoutProfile");
const node_cron_1 = __importDefault(require("node-cron"));
const PaymentService_1 = require("./PaymentService");
async function aggregateTeacherEarnings(month) {
    const [year, mon] = month.split("-").map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 1);
    const config = await PlatformConfig_1.PlatformConfig.findOne();
    if (!config)
        throw new Error("Pay per view not configured");
    const rate = config.payPerView;
    const rows = await ContentView_1.ContentView.aggregate([
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
        await TeacherEarning_1.TeacherEarning.updateOne({
            teacherId: row._id,
            month,
        }, {
            $setOnInsert: {
                teacherId: row._id,
                month,
                views,
                ratePerView: rate,
                grossAmount: amount,
                paid: false,
            },
        }, { upsert: true });
    }
}
async function payTeachersForMonth(month) {
    const earnings = await TeacherEarning_1.TeacherEarning.find({
        month,
        paid: false,
        grossAmount: { $gt: 0 },
    });
    for (const earning of earnings) {
        const profile = await TeacherPayoutProfile_1.TeacherPayoutProfile.findOne({
            teacherId: earning.teacherId,
            active: true,
        });
        if (!profile)
            continue;
        const payout = await PaymentService_1.razorpayHttp.post("/payouts", {
            account_number: process.env.RAZORPAY_MERCHANT_ACCOUNT,
            fund_account_id: profile.fundAccountId,
            amount: Math.round(earning.grossAmount * 100), // paise
            currency: "INR",
            mode: "UPI",
            purpose: "payout",
            reference_id: `${earning._id}_${Date.now()}`,
            queue_if_low_balance: true,
        });
        await TeacherEarning_1.TeacherEarning.updateOne({ _id: earning._id }, {
            paid: true,
            razorpayPayoutId: payout.data.id,
        });
    }
}
node_cron_1.default.schedule("59 23 28-31 * *", async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    // run ONLY if today is last day
    if (tomorrow.getDate() !== 1)
        return;
    const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    await aggregateTeacherEarnings(month);
    await payTeachersForMonth(month);
});
//# sourceMappingURL=TeacherPayout.js.map