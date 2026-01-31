import { z } from 'zod';
export declare const openContentSchema: z.ZodObject<{
    contentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    contentId: string;
}, {
    contentId: string;
}>;
/**
 * Used when student finishes content
 * - Allows optional quizScore (for quizzes)
 * - Forces valid range
 */
export declare const completeContentSchema: z.ZodObject<{
    contentId: z.ZodString;
    quizScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    contentId: string;
    quizScore?: number | undefined;
}, {
    contentId: string;
    quizScore?: number | undefined;
}>;
/**
 * Ping request when student is watching video
 * - Should be called every 15s
 * - We limit increments to 5 minutes (anti-cheat)
 */
export declare const videoPingSchema: z.ZodObject<{
    contentId: z.ZodString;
    secondsSinceLastPing: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    contentId: string;
    secondsSinceLastPing: number;
}, {
    contentId: string;
    secondsSinceLastPing: number;
}>;
//# sourceMappingURL=progress.d.ts.map