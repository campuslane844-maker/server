"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const User_1 = require("../models/User");
const Content_1 = require("../models/Content");
const Progress_1 = require("../models/Progress");
const Order_1 = require("../models/Order");
const asyncHandler_1 = require("../utils/asyncHandler");
const TeacherAnalytics_1 = require("../services/TeacherAnalytics");
const PlatformConfig_1 = require("../models/PlatformConfig");
const ContentView_1 = require("../models/ContentView");
const TeacherEarning_1 = require("../models/TeacherEarning");
class AnalyticsController {
}
exports.AnalyticsController = AnalyticsController;
_a = AnalyticsController;
AnalyticsController.getAdminUserAnalytics = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const [totalStudents, totalTeachers, totalParents, pendingTeachers, approvedTeachers, rejectedTeachers,] = await Promise.all([
        User_1.User.countDocuments({ role: "student", isDeleted: false }),
        User_1.User.countDocuments({ role: "teacher", isDeleted: false }),
        User_1.User.countDocuments({ role: "parent", isDeleted: false }),
        User_1.User.countDocuments({
            role: "teacher",
            approvalStatus: "pending",
            isDeleted: false,
        }),
        User_1.User.countDocuments({
            role: "teacher",
            approvalStatus: "approved",
            isDeleted: false,
        }),
        User_1.User.countDocuments({
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
});
AnalyticsController.getAdminContentAnalytics = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const [contentByType, contentByApproval, topSubjects] = await Promise.all([
        Content_1.Content.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: "$type", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
        Content_1.Content.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: "$approvalStatus", count: { $sum: 1 } } },
        ]),
        Content_1.Content.aggregate([
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
    ]);
    res.status(200).json({
        success: true,
        data: {
            contentByType,
            contentByApproval,
            topSubjects,
        },
    });
});
AnalyticsController.getAdminEngagementAnalytics = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const [completionRate, avgTimeSpent, avgQuizScore] = await Promise.all([
        Progress_1.Progress.aggregate([
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
        Progress_1.Progress.aggregate([
            { $group: { _id: null, avgTimeSpent: { $avg: "$timeSpent" } } },
        ]).then((result) => Math.round(result[0]?.avgTimeSpent || 0)),
        Progress_1.Progress.aggregate([
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
});
AnalyticsController.getAdminSalesAnalytics = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const [salesTotals, salesByCategory, salesBySchool] = await Promise.all([
        Order_1.Order.aggregate([
            { $match: { status: { $ne: "cancelled" } } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                    avgOrderValue: { $avg: "$totalAmount" },
                },
            },
        ]).then((result) => result[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 }),
        Order_1.Order.aggregate([
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
        Order_1.Order.aggregate([
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
});
AnalyticsController.getMyAnalytics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    let teacherId = req.user?._id;
    if (!teacherId)
        teacherId = req.query.teacherId;
    const result = await TeacherAnalytics_1.TeacherAnalyticsService.getTeacherAnalytics(teacherId);
    return res.status(200).json(result);
});
AnalyticsController.getTeacherEarningsAnalytics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    let teacherId = req.user?._id;
    if (!teacherId)
        teacherId = req.query.teacherId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const config = await PlatformConfig_1.PlatformConfig.findOne();
    if (!config)
        throw new Error("Pay per view not configured");
    /* ---------- Estimate ---------- */
    const estimateAgg = await ContentView_1.ContentView.aggregate([
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
    const estimatedAmount = Number((estimatedViews * config.payPerView).toFixed(2));
    /* ---------- Total Paid ---------- */
    const totalAgg = await TeacherEarning_1.TeacherEarning.aggregate([
        { $match: { teacherId, paid: true } },
        { $group: { _id: null, totalPaid: { $sum: "$grossAmount" } } },
    ]);
    const totalPaid = Number(totalAgg[0]?.totalPaid || 0);
    /* ---------- History ---------- */
    const history = await TeacherEarning_1.TeacherEarning.find({ teacherId })
        .sort({ month: -1 })
        .select("month views ratePerView grossAmount paid razorpayPayoutId");
    res.json({
        success: true,
        data: {
            estimated: {
                month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
                views: estimatedViews,
                payPerView: config.payPerView,
                estimatedAmount,
            },
            totalPaid,
            history,
        },
    });
});
//# sourceMappingURL=AnalyticsController.js.map