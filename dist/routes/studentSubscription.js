"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const StudentSubscriptionController_1 = require("../controllers/StudentSubscriptionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * Student subscription routes
 * Base: /api/student-subscription
 */
router.post("/create", auth_1.requireAuth, StudentSubscriptionController_1.createStudentSubscription);
router.get("/me", auth_1.requireAuth, StudentSubscriptionController_1.getMySubscription);
router.post("/cancel", auth_1.requireAuth, StudentSubscriptionController_1.cancelMySubscription);
exports.default = router;
//# sourceMappingURL=studentSubscription.js.map