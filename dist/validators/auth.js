"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLoginSchema = exports.googleSignInSchema = void 0;
const zod_1 = require("zod");
exports.googleSignInSchema = zod_1.z
    .object({
    idToken: zod_1.z.string().min(1, "ID token is required"),
    role: zod_1.z.enum(["student", "teacher", "parent"]).optional(),
    age: zod_1.z.number().min(5).max(18).optional(),
    phone: zod_1.z.string().optional(),
    name: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    pincode: zod_1.z.string().optional(),
    classLevel: zod_1.z.custom().optional(),
    classOther: zod_1.z.string().optional(),
})
    .superRefine((data, ctx) => {
    if (data.role === "student") {
        // Age must be present
        if (data.age === undefined || data.age === null) {
            ctx.addIssue({
                path: ["age"],
                code: "custom",
                message: "Age is required for students",
            });
        }
        // At least one of classLevel or classOther must be present
        if (!data.classLevel && !data.classOther) {
            ctx.addIssue({
                path: ["classLevel"],
                code: "custom",
                message: "Either classLevel or classOther is required for students",
            });
            ctx.addIssue({
                path: ["classOther"],
                code: "custom",
                message: "Either classLevel or classOther is required for students",
            });
        }
    }
});
exports.adminLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
//# sourceMappingURL=auth.js.map