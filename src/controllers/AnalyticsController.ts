import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { User } from "../models/User";
import { Content } from "../models/Content";
import { Progress } from "../models/Progress";
import { Order } from "../models/Order";
import { asyncHandler } from "../utils/asyncHandler";
import { TeacherAnalyticsService } from "../services/TeacherAnalytics";
import { PlatformConfig } from "../models/PlatformConfig";
import { ContentView } from "../models/ContentView";
import { TeacherEarning } from "../models/TeacherEarning";

export class AnalyticsController {
  static getAdminUserAnalytics = asyncHandler(
    async (_req: AuthenticatedRequest, res: Response) => {
      const [
        totalStudents,
        totalTeachers,
        totalParents,
        pendingTeachers,
        approvedTeachers,
        rejectedTeachers,
      ] = await Promise.all([
        User.countDocuments({ role: "student", isDeleted: false }),
        User.countDocuments({ role: "teacher", isDeleted: false }),
        User.countDocuments({ role: "parent", isDeleted: false }),
        User.countDocuments({
          role: "teacher",
          approvalStatus: "pending",
          isDeleted: false,
        }),
        User.countDocuments({
          role: "teacher",
          approvalStatus: "approved",
          isDeleted: false,
        }),
        User.countDocuments({
          role: "teacher",
          approvalStatus: "rejected",
          isDeleted: false,
        }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          users: {
            totalStudents,
            totalTeachers,
            totalParents,
            total: totalStudents + totalTeachers + totalParents,
          },
          teachers: {
            pending: pendingTeachers,
            approved: approvedTeachers,
            rejected: rejectedTeachers,
          },
        },
      });
    }
  );

  static getAdminContentAnalytics = asyncHandler(
    async (_req: AuthenticatedRequest, res: Response) => {
      const [contentByType, contentByApproval, topSubjects] = await Promise.all(
        [
          Content.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: "$type", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),
          Content.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: "$approvalStatus", count: { $sum: 1 } } },
          ]),
          Content.aggregate([
            { $match: { isDeleted: false, approvalStatus: "approved" } },
            {
              $lookup: {
                from: "subjects",
                localField: "subjectId",
                foreignField: "_id",
                as: "subject",
              },
            },
            { $unwind: "$subject" },
            { $group: { _id: "$subject.name", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ]),
        ]
      );

      res.status(200).json({
        success: true,
        data: {
          contentByType,
          contentByApproval,
          topSubjects,
        },
      });
    }
  );

  static getAdminEngagementAnalytics = asyncHandler(
    async (_req: AuthenticatedRequest, res: Response) => {
      const [completionRate, avgTimeSpent, avgQuizScore] = await Promise.all([
        Progress.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: {
                  $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              completionRate: {
                $cond: [
                  { $eq: ["$total", 0] },
                  0,
                  { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
                ],
              },
            },
          },
        ]).then((result) => result[0]?.completionRate || 0),
        Progress.aggregate([
          { $group: { _id: null, avgTimeSpent: { $avg: "$timeSpent" } } },
        ]).then((result) => Math.round(result[0]?.avgTimeSpent || 0)),
        Progress.aggregate([
          { $match: { quizScore: { $exists: true } } },
          { $group: { _id: null, avgScore: { $avg: "$quizScore" } } },
        ]).then((result) => Math.round((result[0]?.avgScore || 0) * 100) / 100),
      ]);

      res.status(200).json({
        success: true,
        data: {
          completionRate: Math.round(completionRate * 100) / 100,
          avgTimeSpent,
          avgQuizScore,
        },
      });
    }
  );

  static getAdminSalesAnalytics = asyncHandler(
    async (_req: AuthenticatedRequest, res: Response) => {
      const [salesTotals, salesByCategory, salesBySchool] = await Promise.all([
        Order.aggregate([
          { $match: { status: { $ne: "cancelled" } } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: "$totalAmount" },
              avgOrderValue: { $avg: "$totalAmount" },
            },
          },
        ]).then(
          (result) =>
            result[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 }
        ),
        Order.aggregate([
          { $match: { status: { $ne: "cancelled" } } },
          { $unwind: "$items" },
          {
            $lookup: {
              from: "products",
              localField: "items.productId",
              foreignField: "_id",
              as: "product",
            },
          },
          { $unwind: "$product" },
          {
            $lookup: {
              from: "categories",
              localField: "product.category",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: "$category" },
          {
            $group: {
              _id: "$category.name",
              revenue: {
                $sum: { $multiply: ["$items.price", "$items.quantity"] },
              },
              orders: { $sum: 1 },
            },
          },
          { $sort: { revenue: -1 } },
          { $limit: 5 },
        ]),
        Order.aggregate([
          { $match: { status: { $ne: "cancelled" } } },
          { $unwind: "$items" },
          {
            $lookup: {
              from: "products",
              localField: "items.productId",
              foreignField: "_id",
              as: "product",
            },
          },
          { $unwind: "$product" },
          { $match: { "product.school": { $exists: true } } },
          {
            $lookup: {
              from: "schools",
              localField: "product.school",
              foreignField: "_id",
              as: "school",
            },
          },
          { $unwind: "$school" },
          {
            $group: {
              _id: "$school.name",
              revenue: {
                $sum: { $multiply: ["$items.price", "$items.quantity"] },
              },
              orders: { $sum: 1 },
            },
          },
          { $sort: { revenue: -1 } },
          { $limit: 5 },
        ]),
      ]);

      res.status(200).json({
        success: true,
        data: {
          totals: salesTotals,
          byCategory: salesByCategory,
          bySchool: salesBySchool,
        },
      });
    }
  );

  static getMyAnalytics = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      let teacherId = req.user?._id;
      if(!teacherId) teacherId = req.query.teacherId
      const result = await TeacherAnalyticsService.getTeacherAnalytics(
        teacherId
      );

      return res.status(200).json(result);
    }
  );

  static getTeacherEarningsAnalytics = asyncHandler(async (req: AuthenticatedRequest, res) => {
    let teacherId = req.user?._id;
    if(!teacherId) teacherId = req.query.teacherId
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const config = await PlatformConfig.findOne();
    if (!config) throw new Error("Pay per view not configured");

    /* ---------- Estimate ---------- */
    const estimateAgg = await ContentView.aggregate([
      { $match: { viewedAt: { $gte: startOfMonth, $lte: now } } },
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
          "content.uploaderId": teacherId,
          "content.uploaderRole": "teacher",
        },
      },
      {
        $group: {
          _id: null,
          views: { $sum: 1 },
        },
      },
    ]);

    const estimatedViews = estimateAgg[0]?.views || 0;
    const estimatedAmount = Number(
      (estimatedViews * config.payPerView).toFixed(2)
    );

    /* ---------- Total Paid ---------- */
    const totalAgg = await TeacherEarning.aggregate([
      { $match: { teacherId, paid: true } },
      { $group: { _id: null, totalPaid: { $sum: "$grossAmount" } } },
    ]);

    const totalPaid = Number(totalAgg[0]?.totalPaid || 0);

    /* ---------- History ---------- */
    const history = await TeacherEarning.find({ teacherId })
      .sort({ month: -1 })
      .select("month views ratePerView grossAmount paid razorpayPayoutId");

    res.json({
      success: true,
      data: {
        estimated: {
          month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
            2,
            "0"
          )}`,
          views: estimatedViews,
          payPerView: config.payPerView,
          estimatedAmount,
        },
        totalPaid,
        history,
      },
    });
  });
}
