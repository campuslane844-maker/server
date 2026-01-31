"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const NotificationController_1 = require("../controllers/NotificationController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const common_1 = require("../validators/common");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAdminAuth, (0, validation_1.validateQuery)(common_1.paginationSchema), NotificationController_1.NotificationController.getNotifications);
router.patch('/:id/read', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), NotificationController_1.NotificationController.markAsRead);
router.delete('/:id', auth_1.requireAdminAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), NotificationController_1.NotificationController.deleteNotification);
exports.default = router;
//# sourceMappingURL=notifications.js.map