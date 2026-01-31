"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyReferralInfo = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const Referral_1 = require("../models/Referral");
const User_1 = require("../models/User");
const MAX_REFERRAL_REWARDS = 3;
exports.getMyReferralInfo = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    // Ensure user exists and is a teacher
    const teacher = await User_1.User.findOne({
        _id: userId,
        role: "teacher",
        isDeleted: false,
    }).select("referralCode");
    if (!teacher || !teacher.referralCode) {
        throw new Error("Referral information not available");
    }
    // Count total referrals
    const totalReferrals = await Referral_1.Referral.countDocuments({
        referrer: userId,
    });
    // Count rewarded referrals
    const rewardedReferrals = await Referral_1.Referral.countDocuments({
        referrer: userId,
        rewardGranted: true,
    });
    res.status(200).json({
        success: true,
        data: {
            referralCode: teacher.referralCode,
            referralLink: `${process.env.FRONTEND_URL}/auth?ref=${teacher.referralCode}`,
            totalReferrals,
            rewardedReferrals,
            remainingRewards: Math.max(0, MAX_REFERRAL_REWARDS - rewardedReferrals),
            maxRewards: MAX_REFERRAL_REWARDS,
        },
    });
});
//# sourceMappingURL=ReferralController.js.map