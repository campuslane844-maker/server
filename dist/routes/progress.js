"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProgressController_1 = require("../controllers/ProgressController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const progress_1 = require("../validators/progress");
const common_1 = require("../validators/common");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
/**
 * Student opens content — creates/updates progress entry with status=in_progress
 */
router.post('/open', auth_1.requireAuth, (0, validation_1.validateBody)(progress_1.openContentSchema), ProgressController_1.ProgressController.openContent);
/**
 * Mark content as complete (with optional quizScore)
 * Also sets completedAt timestamp and status=completed
 */
router.post('/complete', auth_1.requireAuth, (0, validation_1.validateBody)(progress_1.completeContentSchema), ProgressController_1.ProgressController.completeContent);
/**
 * Video watch ping — increments timeSpent
 * Should not exceed 5 min increments per ping
 */
router.post('/video/ping', auth_1.requireAuth, (0, validation_1.validateBody)(progress_1.videoPingSchema), ProgressController_1.ProgressController.recordVideoTime);
/**
 * Get logged-in student's progress, filterable by class/subject
 */
router.get('/mine', auth_1.requireAuth, (0, validation_1.validateQuery)(common_1.paginationSchema.extend({
    classId: common_1.mongoIdSchema.optional(),
    subjectId: common_1.mongoIdSchema.optional(),
    status: zod_1.z.enum(['not_started', 'in_progress', 'completed']).optional(),
})), ProgressController_1.ProgressController.getMyProgress);
/**
 * Get logged-in student's recently visited content
 */
router.get("/recent", auth_1.requireAuth, ProgressController_1.ProgressController.getRecentlyVisited);
/**
 * Get logged-in student's content progress
 */
router.get('/content/:id', auth_1.requireAuth, ProgressController_1.ProgressController.getContentProgress);
/**
 * Parent can view child's progress
 */
router.get('/child/:studentId', auth_1.requireAuth, (0, auth_1.requireRole)('parent'), (0, validation_1.validateParams)(zod_1.z.object({ studentId: common_1.mongoIdSchema })), ProgressController_1.ProgressController.getChildProgress);
/**
 * Admin can view child's progress
 */
router.get('/admin/:studentId', auth_1.requireAnyAuth, (0, validation_1.validateParams)(zod_1.z.object({ studentId: common_1.mongoIdSchema })), ProgressController_1.ProgressController.getStudentProgress);
/**
 * Admin/teacher can delete a progress record
 */
router.delete('/:id', auth_1.requireAuth, (0, auth_1.requireRole)(['admin', 'teacher']), (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), ProgressController_1.ProgressController.deleteProgress);
exports.default = router;
//# sourceMappingURL=progress.js.map