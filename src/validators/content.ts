import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  description: z.string().optional(),
  thumbnailKey: z.string(),
});

export const updateClassSchema = createClassSchema.partial();

export const createSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  description: z.string().optional(),
  classId: z.string().min(1, "Class ID is required"),
  thumbnailKey: z.string(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const createChapterSchema = z.object({
  name: z.string().min(1, "Chapter name is required"),
  description: z.string().optional(),
  subjectId: z.string().min(1, "Subject ID is required"),
  order: z.number().int().min(0).default(0),
  thumbnailKey: z.string(),
});

export const updateChapterSchema = createChapterSchema.partial();

const questionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  s3Key: z.string().optional(),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .length(4, "Each question must have exactly 4 options"),
  correctOption: z
    .number()
    .int()
    .min(0, "Correct option must be between 0 and 3")
    .max(3, "Correct option must be between 0 and 3"),
});

export const createContentSchema = z
  .object({
    uploaderRole: z.enum(["admin", "teacher"]),

    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),

    paid: z.boolean(),

    classId: z.string().min(1, "Class ID is required"),
    subjectId: z.string().min(1, "Subject ID is required"),
    chapterId: z.string().min(1, "Chapter ID is required"),

    type: z.enum(["file", "video", "quiz", "game", "image"]),

    s3Key: z.string().optional(),
    thumbnailKey: z.string(),
    fileUrl: z.string().url().optional(),
    videoUrl: z.string().url().optional(),

    duration: z.number().nullable().transform((v) => v ?? undefined),
    fileSize: z
      .number()
      .nullable()
      .optional()
      .transform((v) => (v == null ? undefined : v)),

    quizType: z.enum(["googleForm", "native"]).optional(),
    googleFormUrl: z.string().url().optional(),
    questions: z.array(questionSchema).optional(),

    feedback: z.string().optional(),
    tags: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    /* ===== FORCE PAID FOR TEACHERS ===== */
    if (data.uploaderRole === "teacher" && data.paid !== true) {
      ctx.addIssue({
        path: ["paid"],
        code: z.ZodIssueCode.custom,
        message: "Content uploaded by teachers must be paid",
      });
    }

    /* ===== EXISTING RULES ===== */
    if (data.type !== "quiz" && !data.s3Key) {
      ctx.addIssue({
        path: ["s3Key"],
        code: z.ZodIssueCode.custom,
        message: "s3Key is required for non-quiz content",
      });
    }

    if (data.type === "quiz" && !data.quizType) {
      ctx.addIssue({
        path: ["quizType"],
        code: z.ZodIssueCode.custom,
        message: "quizType is required for quiz content",
      });
    }

    if (data.type === "video") {
      if (data.duration === undefined) {
        ctx.addIssue({
          path: ["duration"],
          code: z.ZodIssueCode.custom,
          message: "duration is required for video content",
        });
      }
      if (data.fileSize === undefined) {
        ctx.addIssue({
          path: ["fileSize"],
          code: z.ZodIssueCode.custom,
          message: "fileSize is required for video content",
        });
      }
    }

    if (data.type === "quiz" && data.quizType === "googleForm" && !data.googleFormUrl) {
      ctx.addIssue({
        path: ["googleFormUrl"],
        code: z.ZodIssueCode.custom,
        message: "googleFormUrl is required for Google Form quizzes",
      });
    }

    if (data.type === "quiz" && data.quizType === "native") {
      if (!data.questions?.length) {
        ctx.addIssue({
          path: ["questions"],
          code: z.ZodIssueCode.custom,
          message: "At least one question is required for native quizzes",
        });
      }
    }
  });

const contentBase = createContentSchema._def.schema;
export const updateContentSchema = contentBase.partial();
