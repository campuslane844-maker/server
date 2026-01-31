"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const body_parser_1 = __importDefault(require("body-parser"));
const RazorpayWebhookController_1 = require("../controllers/RazorpayWebhookController");
const router = (0, express_1.Router)();
/**
 * Razorpay requires RAW body
 */
router.post("/razorpay", body_parser_1.default.raw({ type: "application/json" }), RazorpayWebhookController_1.razorpayWebhookHandler);
exports.default = router;
//# sourceMappingURL=razorpayWebhook.js.map