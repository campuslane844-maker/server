"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ShippingController_1 = require("../controllers/ShippingController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/shipping/
 * @desc    Get shipping cost
 * @access  Public
 */
router.get("/", ShippingController_1.getShipping);
/**
 * @route   POST /api/shipping/
 * @desc    Update shipping cost
 * @access  Private (require admin auth)
 */
router.patch("/", auth_1.requireAdminAuth, ShippingController_1.updateShipping);
exports.default = router;
//# sourceMappingURL=shipping.js.map