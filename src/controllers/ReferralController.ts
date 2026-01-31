import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Referral } from "../models/Referral";
import { User } from "../models/User";
import { AuthenticatedRequest } from "../middleware/auth";

const MAX_REFERRAL_REWARDS = 3;

export const getMyReferralInfo = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user._id;

    // Ensure user exists and is a teacher
    const teacher = await User.findOne({
      _id: userId,
      role: "teacher",
      isDeleted: false,
    }).select("referralCode");

    if (!teacher || !teacher.referralCode) {
      throw new Error("Referral information not available");
    }

    // Count total referrals
    const totalReferrals = await Referral.countDocuments({
      referrer: userId,
    });

    // Count rewarded referrals
    const rewardedReferrals = await Referral.countDocuments({
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
        remainingRewards: Math.max(
          0,
          MAX_REFERRAL_REWARDS - rewardedReferrals
        ),
        maxRewards: MAX_REFERRAL_REWARDS,
      },
    });
  }
);
