"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presignSchema = exports.paginationSchema = exports.mongoIdSchema = void 0;
const zod_1 = require("zod");
exports.mongoIdSchema = zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).default('20'),
    sort: zod_1.z.string().optional(),
    dir: zod_1.z.enum(['asc', 'desc']).default('asc'),
    search: zod_1.z.string().optional(),
    includeDeleted: zod_1.z.string().transform(val => val === 'true').default('false'),
});
exports.presignSchema = zod_1.z.object({
    fileName: zod_1.z.string().min(1, 'File name is required'),
    contentType: zod_1.z.string().min(1, 'Content type is required'),
    fileSize: zod_1.z.number().max(300 * 1024 * 1024, 'File size must be less than 300MB'),
});
//# sourceMappingURL=common.js.map