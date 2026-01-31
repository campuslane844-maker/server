import mongoose from "mongoose";
export declare class TeacherAnalyticsService {
    static getTeacherAnalytics(teacherId: mongoose.Types.ObjectId): Promise<{
        success: boolean;
        overview: {
            todayViews: any;
            last7DaysViews: any;
            weeklyTrend: number | null;
            allTimeViews: any;
            totalUniqueUsers: any;
            avgViewsPerUser: number;
        };
        contentHealth: {
            totalContent: any;
            zeroViewContent: any;
            lowPerformingContent: any;
            avgViewsPerContent: number;
        };
        audience: {
            activeUsersLast30Days: any;
        };
        recentlyUploadedContent: any;
        bestPerformingContent: any;
        charts: {
            daily: any;
            monthly: any;
            byType: any;
        };
    }>;
}
//# sourceMappingURL=TeacherAnalytics.d.ts.map