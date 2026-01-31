import mongoose, { Document } from "mongoose";
export interface ITeacherSubscription extends Document {
    teacherId: mongoose.Types.ObjectId;
    planId: mongoose.Types.ObjectId;
    planCode: string;
    status: "active" | "expired";
    uploadsUsed: number;
    uploadLimit: number | null;
    startDate: Date;
    endDate: Date;
    isFree?: Boolean;
    razorpayPaymentId?: string;
    createdAt: Date;
}
export declare const TeacherSubscription: mongoose.Model<ITeacherSubscription, {}, {}, {}, mongoose.Document<unknown, {}, ITeacherSubscription, {}, mongoose.DefaultSchemaOptions> & ITeacherSubscription & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, mongoose.Schema<ITeacherSubscription, mongoose.Model<ITeacherSubscription, any, any, any, mongoose.Document<unknown, any, ITeacherSubscription, any, {}> & ITeacherSubscription & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ITeacherSubscription, mongoose.Document<unknown, {}, mongoose.FlatRecord<ITeacherSubscription>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<ITeacherSubscription> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>>;
//# sourceMappingURL=TeacherSubscription.d.ts.map