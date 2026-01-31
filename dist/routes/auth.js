"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../validators/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/google', rateLimit_1.authLimiter, AuthController_1.AuthController.googleSignIn);
router.post('/admin/login', rateLimit_1.authLimiter, (0, validation_1.validateBody)(auth_1.adminLoginSchema), AuthController_1.AuthController.adminLogin);
router.get("/me", auth_2.optionalAuth, AuthController_1.AuthController.getMe);
exports.default = router;
//# sourceMappingURL=auth.js.map