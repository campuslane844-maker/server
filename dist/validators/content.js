"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContentSchema = exports.createContentSchema = exports.updateChapterSchema = exports.createChapterSchema = exports.updateSubjectSchema = exports.createSubjectSchema = exports.updateClassSchema = exports.createClassSchema = void 0;
const zod_1 = require("zod");
exports.createClassSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Class name is required"),
    description: zod_1.z.string().optional(),
    thumbnailKey: zod_1.z.string(),
});
exports.updateClassSchema = exports.createClassSchema.partial();
exports.createSubjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Subject name is required"),
    description: zod_1.z.string().optional(),
    classId: zod_1.z.string().min(1, "Class ID is required"),
    thumbnailKey: zod_1.z.string(),
});
exports.updateSubjectSchema = exports.createSubjectSchema.partial();
exports.createChapterSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Chapter name is required"),
    description: zod_1.z.string().optional(),
    subjectId: zod_1.z.string().min(1, "Subject ID is required"),
    order: zod_1.z.number().int().min(0).default(0),
    thumbnailKey: zod_1.z.string(),
});
exports.updateChapterSchema = exports.createChapterSchema.partial();
const questionSchema = zod_1.z.object({
    questionText: zod_1.z.string().min(1, "Question text is required"),
    s3Key: zod_1.z.string().optional(),
    options: zod_1.z
        .array(zod_1.z.string().min(1, "Option cannot be empty"))
        .length(4, "Each question must have exactly 4 options"),
    correctOption: zod_1.z
        .number()
        .int()
        .min(0, "Correct option must be between 0 and 3")
        .max(3, "Correct option must be between 0 and 3"),
});
exports.createContentSchema = zod_1.z
    .object({
    uploaderRole: zod_1.z.enum(["admin", "teacher"]),
    title: zod_1.z.string().min(1, "Title is required"),
    description: zod_1.z.string().optional(),
    paid: zod_1.z.boolean(),
    classId: zod_1.z.string().min(1, "Class ID is required"),
    subjectId: zod_1.z.string().min(1, "Subject ID is required"),
    chapterId: zod_1.z.string().min(1, "Chapter ID is required"),
    type: zod_1.z.enum(["file", "video", "quiz", "game", "image"]),
    s3Key: zod_1.z.string().optional(),
    thumbnailKey: zod_1.z.string(),
    fileUrl: zod_1.z.string().url().optional(),
    videoUrl: zod_1.z.string().url().optional(),
    duration: zod_1.z.number().nullable().transform((v) => v ?? undefined),
    fileSize: zod_1.z
        .number()
        .nullable()
        .optional()
        .transform((v) => (v == null ? undefined : v)),
    quizType: zod_1.z.enum(["googleForm", "native"]).optional(),
    googleFormUrl: zod_1.z.string().url().optional(),
    questions: zod_1.z.array(questionSchema).optional(),
    feedback: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
})
    .superRefine((data, ctx) => {
    /* ===== FORCE PAID FOR TEACHERS ===== */
    if (data.uploaderRole === "teacher" && data.paid !== true) {
        ctx.addIssue({
            path: ["paid"],
            code: zod_1.z.ZodIssueCode.custom,
            message: "Content uploaded by teachers must be paid",
        });
    }
    /* ===== EXISTING RULES ===== */
    if (data.type !== "quiz" && !data.s3Key) {
        ctx.addIssue({
            path: ["s3Key"],
            code: zod_1.z.ZodIssueCode.custom,
            message: "s3Key is required for non-quiz content",
        });
    }
    if (data.type === "quiz" && !data.quizType) {
        ctx.addIssue({
            path: ["quizType"],
            code: zod_1.z.ZodIssueCode.custom,
            message: "quizType is required for quiz content",
        });
    }
    if (data.type === "video") {
        if (data.duration === undefined) {
            ctx.addIssue({
                path: ["duration"],
                code: zod_1.z.ZodIssueCode.custom,
                message: "duration is required for video content",
            });
        }
        if (data.fileSize === undefined) {
            ctx.addIssue({
                path: ["fileSize"],
                code: zod_1.z.ZodIssueCode.custom,
                message: "fileSize is required for video content",
            });
        }
    }
    if (data.type === "quiz" && data.quizType === "googleForm" && !data.googleFormUrl) {
        ctx.addIssue({
            path: ["googleFormUrl"],
            code: zod_1.z.ZodIssueCode.custom,
            message: "googleFormUrl is required for Google Form quizzes",
        });
    }
    if (data.type === "quiz" && data.quizType === "native") {
        if (!data.questions?.length) {
            ctx.addIssue({
                path: ["questions"],
                code: zod_1.z.ZodIssueCode.custom,
                message: "At least one question is required for native quizzes",
            });
        }
    }
});
const contentBase = exports.createContentSchema._def.schema;
exports.updateContentSchema = contentBase.partial();
//# sourceMappingURL=content.js.map