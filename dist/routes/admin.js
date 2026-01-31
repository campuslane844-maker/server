"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = require("../controllers/AdminController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const common_1 = require("../validators/common");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Teacher management
router.get('/teachers', auth_1.requireAdminAuth, (0, validation_1.validateQuery)(common_1.paginationSchema.extend({
    status: zod_1.z.enum(['pending', 'approved', 'rejected']).optional(),
})), AdminController_1.AdminController.getTeachers);
router.get('/teachers/:id', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), AdminController_1.AdminController.getTeacherById);
router.patch('/teachers/:id', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), AdminController_1.AdminController.updateTeacher);
router.delete('/teachers/:id', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), AdminController_1.AdminController.deleteTeacher);
router.patch('/teachers/:id/approve', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), AdminController_1.AdminController.approveTeacher);
router.patch('/teachers/:id/reject', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), AdminController_1.AdminController.rejectTeacher);
// Student management
router.get('/students', auth_1.requireAdminAuth, (0, validation_1.validateQuery)(common_1.paginationSchema), AdminController_1.AdminController.getStudents);
router.get('/students/:id', auth_1.requireAnyAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), AdminController_1.AdminController.getStudentById);
router.patch('/students/:id', auth_1.requireAnyAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), AdminController_1.AdminController.updateStudent);
router.delete('/students/:id', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), AdminController_1.AdminController.deleteStudent);
// Parent management
router.get('/parents', auth_1.requireAdminAuth, (0, validation_1.validateQuery)(common_1.paginationSchema), AdminController_1.AdminController.getParents);
router.get('/parents/:id', auth_1.requireAnyAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), AdminController_1.AdminController.getParentById);
router.patch('/parents/:id', auth_1.requireAnyAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), AdminController_1.AdminController.updateParent);
router.delete('/parents/:id', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), AdminController_1.AdminController.deleteParent);
// Content management
router.get('/content', auth_1.requireAdminAuth, (0, validation_1.validateQuery)(common_1.paginationSchema.extend({
    approvalStatus: zod_1.z.enum(['pending', 'approved', 'rejected']).optional(),
    classId: common_1.mongoIdSchema.optional(),
    subjectId: common_1.mongoIdSchema.optional(),
    chapterId: common_1.mongoIdSchema.optional(),
})), AdminController_1.AdminController.getContentForApproval);
router.patch('/content/:id/approve', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), AdminController_1.AdminController.approveContent);
router.patch('/content/:id/reject', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), AdminController_1.AdminController.rejectContent);
// File upload
router.post('/presign', auth_1.requireAnyAuth, (0, validation_1.validateBody)(common_1.presignSchema), AdminController_1.AdminController.generatePresignedUrl);
exports.default = router;
//# sourceMappingURL=admin.js.map