import { z } from 'zod';
export declare const createParentChildLinkSchema: z.ZodEffects<z.ZodObject<{
    childId: z.ZodOptional<z.ZodString>;
    studentCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    studentCode?: string | undefined;
    childId?: string | undefined;
}, {
    studentCode?: string | undefined;
    childId?: string | undefined;
}>, {
    studentCode?: string | undefined;
    childId?: string | undefined;
}, {
    studentCode?: string | undefined;
    childId?: string | undefined;
}>;
export declare const respondToLinkSchema: z.ZodObject<{
    status: z.ZodEnum<["approved", "rejected"]>;
}, "strip", z.ZodTypeAny, {
    status: "approved" | "rejected";
}, {
    status: "approved" | "rejected";
}>;
//# sourceMappingURL=parentChild.d.ts.map