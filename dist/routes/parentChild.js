"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ParentChildController_1 = require("../controllers/ParentChildController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const parentChild_1 = require("../validators/parentChild");
const common_1 = require("../validators/common");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Parent routes
router.post('/links', auth_1.requireAuth, (0, auth_1.requireRole)('parent'), (0, validation_1.validateBody)(parentChild_1.createParentChildLinkSchema), ParentChildController_1.ParentChildController.createLink);
router.get('/links', auth_1.requireAuth, (0, auth_1.requireRole)('parent'), ParentChildController_1.ParentChildController.getParentLinks);
// Student routes
router.get('/links/pending', auth_1.requireAuth, ParentChildController_1.ParentChildController.getPendingLinks);
router.patch('/links/:id/approve', auth_1.requireAuth, (0, auth_1.requireRole)('student'), (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), ParentChildController_1.ParentChildController.approveLink);
router.patch('/links/:id/reject', auth_1.requireAuth, (0, auth_1.requireRole)('student'), (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), ParentChildController_1.ParentChildController.rejectLink);
router.delete('/links/:id', auth_1.requireAnyAuth, (0, validation_1.validateParams)(zod_1.z.object({ id: common_1.mongoIdSchema })), ParentChildController_1.ParentChildController.deleteLink);
exports.default = router;
//# sourceMappingURL=parentChild.js.map