"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AnalyticsController_1 = require("../controllers/AnalyticsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Admin analytics
router.get('/admin/users', auth_1.requireAdminAuth, AnalyticsController_1.AnalyticsController.getAdminUserAnalytics);
router.get('/admin/content', auth_1.requireAdminAuth, AnalyticsController_1.AnalyticsController.getAdminContentAnalytics);
router.get('/admin/engagement', auth_1.requireAdminAuth, AnalyticsController_1.AnalyticsController.getAdminEngagementAnalytics);
router.get('/admin/sales', auth_1.requireAdminAuth, AnalyticsController_1.AnalyticsController.getAdminSalesAnalytics);
// Teacher analytics
router.get('/teacher', auth_1.requireAnyAuth, AnalyticsController_1.AnalyticsController.getMyAnalytics);
router.get('/teacher/payout', auth_1.requireAnyAuth, AnalyticsController_1.AnalyticsController.getTeacherEarningsAnalytics);
exports.default = router;
//# sourceMappingURL=analytics.js.map