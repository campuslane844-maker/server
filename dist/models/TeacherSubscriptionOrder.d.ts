import mongoose, { Document } from "mongoose";
export interface ITeacherSubscriptionOrder extends Document {
    teacherId: mongoose.Types.ObjectId;
    planId: mongoose.Types.ObjectId;
    razorpayOrderId: string;
    amount: number;
    status: "created" | "paid";
    createdAt: Date;
}
export declare const TeacherSubscriptionOrder: mongoose.Model<ITeacherSubscriptionOrder, {}, {}, {}, mongoose.Document<unknown, {}, ITeacherSubscriptionOrder, {}, mongoose.DefaultSchemaOptions> & ITeacherSubscriptionOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, mongoose.Schema<ITeacherSubscriptionOrder, mongoose.Model<ITeacherSubscriptionOrder, any, any, any, mongoose.Document<unknown, any, ITeacherSubscriptionOrder, any, {}> & ITeacherSubscriptionOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ITeacherSubscriptionOrder, mongoose.Document<unknown, {}, mongoose.FlatRecord<ITeacherSubscriptionOrder>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<ITeacherSubscriptionOrder> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>>;
//# sourceMappingURL=TeacherSubscriptionOrder.d.ts.map