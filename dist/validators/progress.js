"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoPingSchema = exports.completeContentSchema = exports.openContentSchema = void 0;
const zod_1 = require("zod");
exports.openContentSchema = zod_1.z.object({
    contentId: zod_1.z.string().min(1, 'Content ID is required'),
});
/**
 * Used when student finishes content
 * - Allows optional quizScore (for quizzes)
 * - Forces valid range
 */
exports.completeContentSchema = zod_1.z.object({
    contentId: zod_1.z.string().min(1, 'Content ID is required'),
    quizScore: zod_1.z.number().min(0).max(100).optional(),
});
/**
 * Ping request when student is watching video
 * - Should be called every 15s
 * - We limit increments to 5 minutes (anti-cheat)
 */
exports.videoPingSchema = zod_1.z.object({
    contentId: zod_1.z.string().min(1, 'Content ID is required'),
    secondsSinceLastPing: zod_1.z
        .number()
        .min(1, 'Must be greater than 0 seconds')
        .max(300, 'Ping increment too large'),
});
//# sourceMappingURL=progress.js.map