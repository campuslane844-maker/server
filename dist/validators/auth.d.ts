import { z } from "zod";
import mongoose from "mongoose";
export declare const googleSignInSchema: z.ZodEffects<z.ZodObject<{
    idToken: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["student", "teacher", "parent"]>>;
    age: z.ZodOptional<z.ZodNumber>;
    phone: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    pincode: z.ZodOptional<z.ZodString>;
    classLevel: z.ZodOptional<z.ZodType<mongoose.Schema.Types.ObjectId, z.ZodTypeDef, mongoose.Schema.Types.ObjectId>>;
    classOther: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    idToken: string;
    name?: string | undefined;
    phone?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    country?: string | undefined;
    pincode?: string | undefined;
    role?: "student" | "teacher" | "parent" | undefined;
    age?: number | undefined;
    classLevel?: mongoose.Schema.Types.ObjectId | undefined;
    classOther?: string | undefined;
}, {
    idToken: string;
    name?: string | undefined;
    phone?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    country?: string | undefined;
    pincode?: string | undefined;
    role?: "student" | "teacher" | "parent" | undefined;
    age?: number | undefined;
    classLevel?: mongoose.Schema.Types.ObjectId | undefined;
    classOther?: string | undefined;
}>, {
    idToken: string;
    name?: string | undefined;
    phone?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    country?: string | undefined;
    pincode?: string | undefined;
    role?: "student" | "teacher" | "parent" | undefined;
    age?: number | undefined;
    classLevel?: mongoose.Schema.Types.ObjectId | undefined;
    classOther?: string | undefined;
}, {
    idToken: string;
    name?: string | undefined;
    phone?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    country?: string | undefined;
    pincode?: string | undefined;
    role?: "student" | "teacher" | "parent" | undefined;
    age?: number | undefined;
    classLevel?: mongoose.Schema.Types.ObjectId | undefined;
    classOther?: string | undefined;
}>;
export declare const adminLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
//# sourceMappingURL=auth.d.ts.map