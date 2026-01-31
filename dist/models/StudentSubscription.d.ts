import mongoose, { Document } from "mongoose";
export type SubscriptionStatus = "created" | "active" | "authenticated" | "paused" | "cancelled" | "expired";
export interface IStudentSubscription extends Document {
    studentId: mongoose.Types.ObjectId;
    plan: "monthly" | "yearly";
    status: SubscriptionStatus;
    currentStart?: Date;
    currentEnd?: Date;
    razorpaySubscriptionId: string;
    razorpayPlanId: string;
    cancelAtCycleEnd: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const StudentSubscription: mongoose.Model<IStudentSubscription, {}, {}, {}, mongoose.Document<unknown, {}, IStudentSubscription, {}, mongoose.DefaultSchemaOptions> & IStudentSubscription & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, mongoose.Schema<IStudentSubscription, mongoose.Model<IStudentSubscription, any, any, any, mongoose.Document<unknown, any, IStudentSubscription, any, {}> & IStudentSubscription & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, IStudentSubscription, mongoose.Document<unknown, {}, mongoose.FlatRecord<IStudentSubscription>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<IStudentSubscription> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>>;
//# sourceMappingURL=StudentSubscription.d.ts.map