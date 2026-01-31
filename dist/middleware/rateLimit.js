"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLimiter = exports.generalLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 100 * 60 * 1000, // 15 minutes
    max: 10000, // limit each IP to 10 requests per windowMs
    message: {
        error: 'Too many authentication attempts, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 100 * 60 * 1000, // 15 minutes
    max: 10000, // limit each IP to 1000 requests per windowMs
    message: {
        error: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 120 * 60 * 1000, // 1 hour
    max: 5000, // limit each IP to 50 upload requests per hour
    message: {
        error: 'Too many upload requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rateLimit.js.map