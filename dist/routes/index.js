"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const admin_1 = __importDefault(require("./admin"));
const content_1 = __importDefault(require("./content"));
const progress_1 = __importDefault(require("./progress"));
const parentChild_1 = __importDefault(require("./parentChild"));
const ecommerce_1 = __importDefault(require("./ecommerce"));
const notifications_1 = __importDefault(require("./notifications"));
const analytics_1 = __importDefault(require("./analytics"));
const payment_1 = __importDefault(require("./payment"));
const shipping_1 = __importDefault(require("./shipping"));
const studentSubscription_1 = __importDefault(require("./studentSubscription"));
const teacherSubscription_1 = __importDefault(require("./teacherSubscription"));
const referral_1 = __importDefault(require("./referral"));
const fee_1 = __importDefault(require("./fee"));
const platform_1 = __importDefault(require("./platform"));
const router = (0, express_1.Router)();
// Health check
router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Campus Lane API is running',
        timestamp: new Date().toISOString(),
    });
});
// Route mounting
router.use('/auth', auth_1.default);
router.use('/admin', admin_1.default);
router.use('/platform', platform_1.default);
router.use('/', content_1.default); // Classes, subjects, chapters, content
router.use('/progress', progress_1.default);
router.use('/parent', parentChild_1.default);
router.use('/student', parentChild_1.default);
router.use('/', ecommerce_1.default); // E-commerce routes
router.use('/payment', payment_1.default);
router.use('/shipping', shipping_1.default);
router.use('/notifications', notifications_1.default);
router.use('/analytics', analytics_1.default);
router.use('/student-subscription', studentSubscription_1.default);
router.use('/teacher-subscription', teacherSubscription_1.default);
router.use('/referral', referral_1.default);
router.use('/fees', fee_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map