"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const ContentController_1 = require("../controllers/ContentController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const content_1 = require("../validators/content");
const common_1 = require("../validators/common");
const router = (0, express_1.Router)();
// Home feed
router.get('/home', auth_1.optionalAuth, ContentController_1.ContentController.getHomePage);
// Classes
router.get('/classes', ContentController_1.ContentController.getClasses);
router.get('/classes/:id', ContentController_1.ContentController.getClassById);
router.post('/classes', auth_1.requireAdminAuth, (0, validation_1.validateBody)(content_1.createClassSchema), ContentController_1.ContentController.createClass);
router.patch('/classes/:id', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), (0, validation_1.validateBody)(content_1.updateClassSchema), ContentController_1.ContentController.updateClass);
router.delete('/classes/:id', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), ContentController_1.ContentController.deleteClass);
// Subjects
router.get('/subjects', (0, validation_1.validateQuery)(common_1.paginationSchema.extend({ classId: common_1.mongoIdSchema.optional() })), ContentController_1.ContentController.getSubjects);
router.get('/subjects/:id', ContentController_1.ContentController.getSubjectById);
router.post('/subjects', auth_1.requireAdminAuth, (0, validation_1.validateBody)(content_1.createSubjectSchema), ContentController_1.ContentController.createSubject);
router.patch('/subjects/:id', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), (0, validation_1.validateBody)(content_1.updateSubjectSchema), ContentController_1.ContentController.updateSubject);
router.delete('/subjects/:id', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), ContentController_1.ContentController.deleteSubject);
// Chapters
router.get('/chapters', (0, validation_1.validateQuery)(common_1.paginationSchema.extend({ subjectId: common_1.mongoIdSchema.optional() })), ContentController_1.ContentController.getChapters);
router.get('/chapters/:id', ContentController_1.ContentController.getChapterById);
router.post('/chapters', auth_1.requireAdminAuth, (0, validation_1.validateBody)(content_1.createChapterSchema), ContentController_1.ContentController.createChapter);
router.patch('/chapters/:id', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), (0, validation_1.validateBody)(content_1.updateChapterSchema), ContentController_1.ContentController.updateChapter);
router.delete('/chapters/:id', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), ContentController_1.ContentController.deleteChapter);
// Content
router.get('/content', auth_1.optionalAuth, (0, validation_1.validateQuery)(common_1.paginationSchema.extend({
    classId: common_1.mongoIdSchema.optional(),
    subjectId: common_1.mongoIdSchema.optional(),
    chapterId: common_1.mongoIdSchema.optional(),
    paid: zod_1.z.string().optional(),
    isAdminContent: zod_1.z.enum(['true', 'false']).optional(),
    type: zod_1.z.enum(['file', 'video', 'quiz', 'game', 'image']).optional(),
    approvalStatus: zod_1.z.enum(['pending', 'approved', 'rejected']).optional(),
})), ContentController_1.ContentController.getContent);
router.get('/content/user', auth_1.optionalAuth, (0, validation_1.validateQuery)(common_1.paginationSchema.extend({
    classId: common_1.mongoIdSchema.optional(),
    subjectId: common_1.mongoIdSchema.optional(),
    chapterId: common_1.mongoIdSchema.optional(),
    paid: zod_1.z.string().optional(),
    isAdminContent: zod_1.z.enum(['true', 'false']).optional(),
    type: zod_1.z.enum(['file', 'video', 'quiz', 'game', 'image']).optional(),
    approvalStatus: zod_1.z.enum(['pending', 'approved', 'rejected']).optional(),
})), ContentController_1.ContentController.getUserContent);
// For teacher dashboard
router.get('/teacher/content', auth_1.requireAnyAuth, (0, validation_1.validateQuery)(common_1.paginationSchema.extend({
    classId: common_1.mongoIdSchema.optional(),
    subjectId: common_1.mongoIdSchema.optional(),
    chapterId: common_1.mongoIdSchema.optional(),
    type: zod_1.z.enum(['file', 'video', 'quiz', 'game', 'image']).optional(),
    approvalStatus: zod_1.z.enum(['pending', 'approved', 'rejected']).optional(),
    uploaderId: common_1.mongoIdSchema.optional(),
})), ContentController_1.ContentController.getTeacherContent);
router.get('/content/:id', auth_1.optionalAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), ContentController_1.ContentController.getContentById);
router.post('/content', auth_1.requireAnyAuth, (0, validation_1.validateBody)(content_1.createContentSchema), ContentController_1.ContentController.createContent);
router.patch('/content/:id', auth_1.requireAnyAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), (0, validation_1.validateBody)(content_1.updateContentSchema), ContentController_1.ContentController.updateContent);
router.delete('/content/:id', auth_1.requireAnyAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), ContentController_1.ContentController.deleteContent);
// Bookmarks
router.get('/bookmarks', auth_1.requireAuth, ContentController_1.ContentController.getBookmark);
router.post('/bookmarks', auth_1.requireAuth, (0, validation_1.validateBody)(zod_1.z.object({ contentId: common_1.mongoIdSchema })), ContentController_1.ContentController.addToBookmark);
router.delete('/bookmarks/:contentId', auth_1.requireAuth, (0, validation_1.validateParams)(zod_1.z.object({ contentId: common_1.mongoIdSchema })), ContentController_1.ContentController.removeFromBookmark);
exports.default = router;
//# sourceMappingURL=content.js.map