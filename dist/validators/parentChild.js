"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondToLinkSchema = exports.createParentChildLinkSchema = void 0;
const zod_1 = require("zod");
exports.createParentChildLinkSchema = zod_1.z.object({
    childId: zod_1.z.string().optional(),
    studentCode: zod_1.z.string().optional(),
}).refine((data) => data.childId || data.studentCode, {
    message: 'Either childId or studentCode is required',
    path: ['childId'],
});
exports.respondToLinkSchema = zod_1.z.object({
    status: zod_1.z.enum(['approved', 'rejected']),
});
//# sourceMappingURL=parentChild.js.map