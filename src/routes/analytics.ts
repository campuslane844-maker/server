import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { requireAdminAuth, requireAnyAuth } from '../middleware/auth';

const router = Router();

// Admin analytics
router.get('/admin/users', requireAdminAuth, AnalyticsController.getAdminUserAnalytics);
router.get('/admin/content', requireAdminAuth, AnalyticsController.getAdminContentAnalytics);
router.get('/admin/engagement', requireAdminAuth, AnalyticsController.getAdminEngagementAnalytics);
router.get('/admin/sales', requireAdminAuth, AnalyticsController.getAdminSalesAnalytics);

// Teacher analytics
router.get('/teacher', requireAnyAuth, AnalyticsController.getMyAnalytics);
router.get('/teacher/payout', requireAnyAuth, AnalyticsController.getTeacherEarningsAnalytics);

export default router;