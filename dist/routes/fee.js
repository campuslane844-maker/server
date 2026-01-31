"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FeeController_1 = require("../controllers/FeeController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * School Fee Routes
 * Base path: /api/fees
 */
router.post("/create-order", auth_1.requireAuth, FeeController_1.createFeeOrder);
router.post("/verify", auth_1.requireAuth, FeeController_1.verifyFeePayment);
router.get("/history", auth_1.requireAuth, FeeController_1.getFeeHistory);
router.get("/config", FeeController_1.getFeeConfig);
router.patch("/config", auth_1.requireAdminAuth, FeeController_1.updateFeeConfig);
exports.default = router;
//# sourceMappingURL=fee.js.map