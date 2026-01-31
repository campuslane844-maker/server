import { z } from 'zod';
export declare const mongoIdSchema: z.ZodString;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
    limit: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
    sort: z.ZodOptional<z.ZodString>;
    dir: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    search: z.ZodOptional<z.ZodString>;
    includeDeleted: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    includeDeleted: boolean;
    dir: "asc" | "desc";
    sort?: string | undefined;
    search?: string | undefined;
}, {
    sort?: string | undefined;
    search?: string | undefined;
    limit?: string | undefined;
    page?: string | undefined;
    includeDeleted?: string | undefined;
    dir?: "asc" | "desc" | undefined;
}>;
export declare const presignSchema: z.ZodObject<{
    fileName: z.ZodString;
    contentType: z.ZodString;
    fileSize: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    fileSize: number;
    contentType: string;
    fileName: string;
}, {
    fileSize: number;
    contentType: string;
    fileName: string;
}>;
//# sourceMappingURL=common.d.ts.map