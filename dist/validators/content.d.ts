import { z } from "zod";
export declare const createClassSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    thumbnailKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    thumbnailKey: string;
    description?: string | undefined;
}, {
    name: string;
    thumbnailKey: string;
    description?: string | undefined;
}>;
export declare const updateClassSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    thumbnailKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    thumbnailKey?: string | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    thumbnailKey?: string | undefined;
}>;
export declare const createSubjectSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    classId: z.ZodString;
    thumbnailKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    classId: string;
    thumbnailKey: string;
    description?: string | undefined;
}, {
    name: string;
    classId: string;
    thumbnailKey: string;
    description?: string | undefined;
}>;
export declare const updateSubjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    classId: z.ZodOptional<z.ZodString>;
    thumbnailKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    classId?: string | undefined;
    thumbnailKey?: string | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    classId?: string | undefined;
    thumbnailKey?: string | undefined;
}>;
export declare const createChapterSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    subjectId: z.ZodString;
    order: z.ZodDefault<z.ZodNumber>;
    thumbnailKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    subjectId: string;
    thumbnailKey: string;
    order: number;
    description?: string | undefined;
}, {
    name: string;
    subjectId: string;
    thumbnailKey: string;
    description?: string | undefined;
    order?: number | undefined;
}>;
export declare const updateChapterSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    subjectId: z.ZodOptional<z.ZodString>;
    order: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    thumbnailKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    subjectId?: string | undefined;
    thumbnailKey?: string | undefined;
    order?: number | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    subjectId?: string | undefined;
    thumbnailKey?: string | undefined;
    order?: number | undefined;
}>;
export declare const createContentSchema: z.ZodEffects<z.ZodObject<{
    uploaderRole: z.ZodEnum<["admin", "teacher"]>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    paid: z.ZodBoolean;
    classId: z.ZodString;
    subjectId: z.ZodString;
    chapterId: z.ZodString;
    type: z.ZodEnum<["file", "video", "quiz", "game", "image"]>;
    s3Key: z.ZodOptional<z.ZodString>;
    thumbnailKey: z.ZodString;
    fileUrl: z.ZodOptional<z.ZodString>;
    videoUrl: z.ZodOptional<z.ZodString>;
    duration: z.ZodEffects<z.ZodNullable<z.ZodNumber>, number | undefined, number | null>;
    fileSize: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodNumber>>, number | undefined, number | null | undefined>;
    quizType: z.ZodOptional<z.ZodEnum<["googleForm", "native"]>>;
    googleFormUrl: z.ZodOptional<z.ZodString>;
    questions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        questionText: z.ZodString;
        s3Key: z.ZodOptional<z.ZodString>;
        options: z.ZodArray<z.ZodString, "many">;
        correctOption: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        options: string[];
        questionText: string;
        correctOption: number;
        s3Key?: string | undefined;
    }, {
        options: string[];
        questionText: string;
        correctOption: number;
        s3Key?: string | undefined;
    }>, "many">>;
    feedback: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    paid: boolean;
    type: "file" | "video" | "quiz" | "game" | "image";
    title: string;
    classId: string;
    subjectId: string;
    chapterId: string;
    thumbnailKey: string;
    uploaderRole: "teacher" | "admin";
    tags: string[];
    description?: string | undefined;
    s3Key?: string | undefined;
    duration?: number | undefined;
    fileSize?: number | undefined;
    quizType?: "googleForm" | "native" | undefined;
    googleFormUrl?: string | undefined;
    questions?: {
        options: string[];
        questionText: string;
        correctOption: number;
        s3Key?: string | undefined;
    }[] | undefined;
    feedback?: string | undefined;
    fileUrl?: string | undefined;
    videoUrl?: string | undefined;
}, {
    paid: boolean;
    type: "file" | "video" | "quiz" | "game" | "image";
    title: string;
    classId: string;
    subjectId: string;
    chapterId: string;
    duration: number | null;
    thumbnailKey: string;
    uploaderRole: "teacher" | "admin";
    description?: string | undefined;
    s3Key?: string | undefined;
    fileSize?: number | null | undefined;
    quizType?: "googleForm" | "native" | undefined;
    googleFormUrl?: string | undefined;
    questions?: {
        options: string[];
        questionText: string;
        correctOption: number;
        s3Key?: string | undefined;
    }[] | undefined;
    feedback?: string | undefined;
    tags?: string[] | undefined;
    fileUrl?: string | undefined;
    videoUrl?: string | undefined;
}>, {
    paid: boolean;
    type: "file" | "video" | "quiz" | "game" | "image";
    title: string;
    classId: string;
    subjectId: string;
    chapterId: string;
    thumbnailKey: string;
    uploaderRole: "teacher" | "admin";
    tags: string[];
    description?: string | undefined;
    s3Key?: string | undefined;
    duration?: number | undefined;
    fileSize?: number | undefined;
    quizType?: "googleForm" | "native" | undefined;
    googleFormUrl?: string | undefined;
    questions?: {
        options: string[];
        questionText: string;
        correctOption: number;
        s3Key?: string | undefined;
    }[] | undefined;
    feedback?: string | undefined;
    fileUrl?: string | undefined;
    videoUrl?: string | undefined;
}, {
    paid: boolean;
    type: "file" | "video" | "quiz" | "game" | "image";
    title: string;
    classId: string;
    subjectId: string;
    chapterId: string;
    duration: number | null;
    thumbnailKey: string;
    uploaderRole: "teacher" | "admin";
    description?: string | undefined;
    s3Key?: string | undefined;
    fileSize?: number | null | undefined;
    quizType?: "googleForm" | "native" | undefined;
    googleFormUrl?: string | undefined;
    questions?: {
        options: string[];
        questionText: string;
        correctOption: number;
        s3Key?: string | undefined;
    }[] | undefined;
    feedback?: string | undefined;
    tags?: string[] | undefined;
    fileUrl?: string | undefined;
    videoUrl?: string | undefined;
}>;
export declare const updateContentSchema: z.ZodObject<{
    uploaderRole: z.ZodOptional<z.ZodEnum<["admin", "teacher"]>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    paid: z.ZodOptional<z.ZodBoolean>;
    classId: z.ZodOptional<z.ZodString>;
    subjectId: z.ZodOptional<z.ZodString>;
    chapterId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["file", "video", "quiz", "game", "image"]>>;
    s3Key: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    thumbnailKey: z.ZodOptional<z.ZodString>;
    fileUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    videoUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    duration: z.ZodOptional<z.ZodEffects<z.ZodNullable<z.ZodNumber>, number | undefined, number | null>>;
    fileSize: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodNumber>>, number | undefined, number | null | undefined>>;
    quizType: z.ZodOptional<z.ZodOptional<z.ZodEnum<["googleForm", "native"]>>>;
    googleFormUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    questions: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        questionText: z.ZodString;
        s3Key: z.ZodOptional<z.ZodString>;
        options: z.ZodArray<z.ZodString, "many">;
        correctOption: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        options: string[];
        questionText: string;
        correctOption: number;
        s3Key?: string | undefined;
    }, {
        options: string[];
        questionText: string;
        correctOption: number;
        s3Key?: string | undefined;
    }>, "many">>>;
    feedback: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    tags: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    paid?: boolean | undefined;
    type?: "file" | "video" | "quiz" | "game" | "image" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    s3Key?: string | undefined;
    classId?: string | undefined;
    subjectId?: string | undefined;
    chapterId?: string | undefined;
    duration?: number | undefined;
    fileSize?: number | undefined;
    thumbnailKey?: string | undefined;
    quizType?: "googleForm" | "native" | undefined;
    googleFormUrl?: string | undefined;
    questions?: {
        options: string[];
        questionText: string;
        correctOption: number;
        s3Key?: string | undefined;
    }[] | undefined;
    uploaderRole?: "teacher" | "admin" | undefined;
    feedback?: string | undefined;
    tags?: string[] | undefined;
    fileUrl?: string | undefined;
    videoUrl?: string | undefined;
}, {
    paid?: boolean | undefined;
    type?: "file" | "video" | "quiz" | "game" | "image" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    s3Key?: string | undefined;
    classId?: string | undefined;
    subjectId?: string | undefined;
    chapterId?: string | undefined;
    duration?: number | null | undefined;
    fileSize?: number | null | undefined;
    thumbnailKey?: string | undefined;
    quizType?: "googleForm" | "native" | undefined;
    googleFormUrl?: string | undefined;
    questions?: {
        options: string[];
        questionText: string;
        correctOption: number;
        s3Key?: string | undefined;
    }[] | undefined;
    uploaderRole?: "teacher" | "admin" | undefined;
    feedback?: string | undefined;
    tags?: string[] | undefined;
    fileUrl?: string | undefined;
    videoUrl?: string | undefined;
}>;
//# sourceMappingURL=content.d.ts.map