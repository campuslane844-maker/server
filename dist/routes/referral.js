"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ReferralController_1 = require("../controllers/ReferralController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/me", auth_1.requireAnyAuth, ReferralController_1.getMyReferralInfo);
exports.default = router;
//# sourceMappingURL=referral.js.map