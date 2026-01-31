import { Request, Response } from "express";
import { User } from "../models/User";
import { StudentSubscription } from "../models/StudentSubscription";
import { TeacherSubscription } from "../models/TeacherSubscription";
import { Order } from "../models/Order";
import { Content } from "../models/Content";
import { FeePayment } from "../models/FeePayment";
import { TeacherEarning } from "../models/TeacherEarning";

/**
 * GET /admin/analytics/overview
 */
export const getPlatformOverview = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const [
      // 👥 Users
      totalStudents,
      totalParents,
      totalTeachers,

      // 📚 Subscriptions
      studentSubscriptionsThisMonth,
      teacherSubscriptionsThisMonth,

      // 🛒 Orders
      ordersThisMonth,

      // 📦 Content
      totalContentItems,

      // 💰 Fees
      feePayments,

      // 👨‍🏫 Teacher payouts
      teacherPayoutsThisMonth,
    ] = await Promise.all([
      User.countDocuments({ role: "student", isDeleted: false }),
      User.countDocuments({ role: "parent", isDeleted: false }),
      User.countDocuments({ role: "teacher", isDeleted: false }),

      StudentSubscription.aggregate([
        {
          $match: {
            createdAt: { $gte: monthStart, $lt: monthEnd },
            status: { $in: ["active", "authenticated"] },
          },
        },
        {
          $group: {
            _id: null,
            totalSubscriptions: { $sum: 1 },
          },
        },
      ]),

      TeacherSubscription.aggregate([
        {
          $match: {
            createdAt: { $gte: monthStart, $lt: monthEnd },
            isFree: false,
          },
        },
        {
          $lookup: {
            from: "teacherplans",
            localField: "planId",
            foreignField: "_id",
            as: "plan",
          },
        },
        { $unwind: "$plan" },
        {
          $group: {
            _id: null,
            totalSubscriptions: { $sum: 1 },
            revenue: { $sum: "$plan.price" },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: monthStart, $lt: monthEnd },
            paymentStatus: { $in: ["paid", "success"] },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalOrderValue: { $sum: "$totalAmount" },
          },
        },
      ]),

      Content.countDocuments({ isDeleted: false }),

      FeePayment.aggregate([
        {
          $match: {
            status: "Paid",
            paidAt: { $gte: monthStart, $lt: monthEnd },
          },
        },
        {
          $group: {
            _id: null,
            totalPayments: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]),

      TeacherEarning.aggregate([
        { $match: { month: monthKey } },
        {
          $group: {
            _id: null,
            totalPayout: { $sum: "$grossAmount" },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users: {
          students: totalStudents,
          parents: totalParents,
          teachers: totalTeachers,
        },

        subscriptions: {
          students: {
            count: studentSubscriptionsThisMonth[0]?.totalSubscriptions || 0,
          },
          teachers: {
            count: teacherSubscriptionsThisMonth[0]?.totalSubscriptions || 0,
            revenue: teacherSubscriptionsThisMonth[0]?.revenue || 0,
          },
        },

        orders: {
          thisMonth: ordersThisMonth[0]?.totalOrders || 0,
          totalValue: ordersThisMonth[0]?.totalOrderValue || 0,
        },

        content: {
          totalItems: totalContentItems,
        },

        fees: {
          totalPayments: feePayments[0]?.totalPayments || 0,
          totalAmount: feePayments[0]?.totalAmount || 0,
        },

        teacherPayouts: {
          thisMonth: teacherPayoutsThisMonth[0]?.totalPayout || 0,
        },
      },
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};
