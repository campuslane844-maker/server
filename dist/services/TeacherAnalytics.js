"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherAnalyticsService = void 0;
const Content_1 = require("../models/Content");
const ContentView_1 = require("../models/ContentView");
const TZ = "Asia/Kolkata";
class TeacherAnalyticsService {
    static async getTeacherAnalytics(teacherId) {
        const now = new Date();
        /* ===========================
           DATE BOUNDARIES (IST SAFE)
        ============================ */
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const startOf7Days = new Date(startOfToday);
        startOf7Days.setDate(startOf7Days.getDate() - 6);
        const startOf14Days = new Date(startOfToday);
        startOf14Days.setDate(startOf14Days.getDate() - 13);
        const startOf30Days = new Date(startOfToday);
        startOf30Days.setDate(startOf30Days.getDate() - 29);
        const startOf12Months = new Date(now);
        startOf12Months.setMonth(startOf12Months.getMonth() - 11);
        startOf12Months.setDate(1);
        /* ============================================================
           CONTENT VIEW ANALYTICS
        ============================================================ */
        const viewPipeline = [
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
                    "content.isDeleted": { $ne: true },
                    "content.approvalStatus": "approved",
                },
            },
            {
                $facet: {
                    /* -------- ALL TIME -------- */
                    allTime: [
                        {
                            $group: {
                                _id: null,
                                totalViews: { $sum: 1 },
                                uniqueUsers: { $addToSet: "$userId" },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                totalViews: 1,
                                totalUniqueUsers: { $size: "$uniqueUsers" },
                            },
                        },
                    ],
                    /* -------- RECENT WINDOWS -------- */
                    today: [
                        { $match: { viewedAt: { $gte: startOfToday } } },
                        { $count: "views" },
                    ],
                    last7Days: [
                        { $match: { viewedAt: { $gte: startOf7Days } } },
                        { $count: "views" },
                    ],
                    prev7Days: [
                        {
                            $match: {
                                viewedAt: { $gte: startOf14Days, $lt: startOf7Days },
                            },
                        },
                        { $count: "views" },
                    ],
                    last30DaysUniqueUsers: [
                        { $match: { viewedAt: { $gte: startOf30Days } } },
                        {
                            $group: {
                                _id: "$userId",
                            },
                        },
                        { $count: "count" },
                    ],
                    /* -------- CHARTS -------- */
                    dailyChart: [
                        { $match: { viewedAt: { $gte: startOf30Days } } },
                        {
                            $group: {
                                _id: {
                                    $dateTrunc: {
                                        date: "$viewedAt",
                                        unit: "day",
                                        timezone: TZ,
                                    },
                                },
                                views: { $sum: 1 },
                            },
                        },
                        { $sort: { _id: 1 } },
                        { $project: { _id: 0, date: "$_id", views: 1 } },
                    ],
                    monthlyChart: [
                        { $match: { viewedAt: { $gte: startOf12Months } } },
                        {
                            $group: {
                                _id: {
                                    $dateTrunc: {
                                        date: "$viewedAt",
                                        unit: "month",
                                        timezone: TZ,
                                    },
                                },
                                views: { $sum: 1 },
                            },
                        },
                        { $sort: { _id: 1 } },
                        { $project: { _id: 0, month: "$_id", views: 1 } },
                    ],
                    /* -------- DISTRIBUTIONS -------- */
                    byType: [
                        {
                            $group: {
                                _id: "$content.type",
                                views: { $sum: 1 },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                type: "$_id",
                                views: 1,
                            },
                        },
                    ],
                    /* -------- TOP CONTENT -------- */
                    bestContent: [
                        {
                            $group: {
                                _id: "$content._id",
                                title: { $first: "$content.title" },
                                type: { $first: "$content.type" },
                                thumbnailKey: { $first: "$content.thumbnailKey" },
                                views: { $sum: 1 },
                                uniqueUsers: { $addToSet: "$userId" },
                            },
                        },
                        {
                            $project: {
                                title: 1,
                                type: 1,
                                thumbnailKey: 1,
                                views: 1,
                                uniqueUsers: { $size: "$uniqueUsers" },
                            },
                        },
                        { $sort: { views: -1 } },
                        { $limit: 5 },
                    ],
                },
            },
        ];
        /* ============================================================
           CONTENT METADATA ANALYTICS
        ============================================================ */
        const contentPipeline = [
            {
                $match: {
                    uploaderId: teacherId,
                    isDeleted: { $ne: true },
                    approvalStatus: "approved",
                },
            },
            {
                $facet: {
                    totals: [{ $count: "totalContent" }],
                    recentlyUploaded: [
                        { $sort: { createdAt: -1 } },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                type: 1,
                                createdAt: 1,
                                uniqueViews: 1,
                                thumbnailKey: 1,
                            },
                        },
                        { $limit: 5 },
                    ],
                    zeroViewContent: [
                        { $match: { uniqueViews: { $eq: 0 } } },
                        { $count: "count" },
                    ],
                    lowPerformingContent: [
                        { $match: { uniqueViews: { $gt: 0, $lt: 10 } } },
                        { $count: "count" },
                    ],
                },
            },
        ];
        /* ===========================
           EXECUTION
        ============================ */
        const [viewAgg] = await ContentView_1.ContentView.aggregate(viewPipeline)
            .allowDiskUse(true)
            .exec();
        const [contentAgg] = await Content_1.Content.aggregate(contentPipeline)
            .allowDiskUse(true)
            .exec();
        /* ===========================
           NORMALIZATION
        ============================ */
        const allTime = viewAgg?.allTime?.[0] ?? {
            totalViews: 0,
            totalUniqueUsers: 0,
        };
        const totalContent = contentAgg?.totals?.[0]?.totalContent ?? 0;
        const last7 = viewAgg?.last7Days?.[0]?.views ?? 0;
        const prev7 = viewAgg?.prev7Days?.[0]?.views ?? 0;
        /* ===========================
           FINAL RESPONSE
        ============================ */
        return {
            success: true,
            overview: {
                todayViews: viewAgg?.today?.[0]?.views ?? 0,
                last7DaysViews: last7,
                weeklyTrend: prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : null,
                allTimeViews: allTime.totalViews,
                totalUniqueUsers: allTime.totalUniqueUsers,
                avgViewsPerUser: allTime.totalUniqueUsers > 0
                    ? Math.round(allTime.totalViews / allTime.totalUniqueUsers)
                    : 0,
            },
            contentHealth: {
                totalContent,
                zeroViewContent: contentAgg?.zeroViewContent?.[0]?.count ?? 0,
                lowPerformingContent: contentAgg?.lowPerformingContent?.[0]?.count ?? 0,
                avgViewsPerContent: totalContent > 0 ? Math.round(allTime.totalViews / totalContent) : 0,
            },
            audience: {
                activeUsersLast30Days: viewAgg?.last30DaysUniqueUsers?.[0]?.count ?? 0,
            },
            recentlyUploadedContent: contentAgg?.recentlyUploaded ?? [],
            bestPerformingContent: viewAgg?.bestContent ?? [],
            charts: {
                daily: viewAgg?.dailyChart ?? [],
                monthly: viewAgg?.monthlyChart ?? [],
                byType: viewAgg?.byType ?? [],
            },
        };
    }
}
exports.TeacherAnalyticsService = TeacherAnalyticsService;
//# sourceMappingURL=TeacherAnalytics.js.map