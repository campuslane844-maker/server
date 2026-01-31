import mongoose, { Document } from "mongoose";
export interface ITeacherPlan extends Document {
    code: string;
    name: string;
    price: number;
    durationDays: number;
    uploadLimit: number | null;
    isFree: boolean;
    isActive: boolean;
    createdAt: Date;
}
export declare const TeacherPlan: mongoose.Model<ITeacherPlan, {}, {}, {}, mongoose.Document<unknown, {}, ITeacherPlan, {}, mongoose.DefaultSchemaOptions> & ITeacherPlan & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, mongoose.Schema<ITeacherPlan, mongoose.Model<ITeacherPlan, any, any, any, mongoose.Document<unknown, any, ITeacherPlan, any, {}> & ITeacherPlan & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ITeacherPlan, mongoose.Document<unknown, {}, mongoose.FlatRecord<ITeacherPlan>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<ITeacherPlan> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>>;
//# sourceMappingURL=TeacherPlan.d.ts.map