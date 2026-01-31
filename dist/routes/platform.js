"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const PlatformController_1 = require("../controllers/PlatformController");
const router = (0, express_1.Router)();
router.get("/analytics/overview", auth_1.requireAnyAuth, PlatformController_1.getPlatformOverview);
exports.default = router;
//# sourceMappingURL=platform.js.map