import mongoose, { Document } from "mongoose";
export interface ITeacherEarning extends Document {
    teacherId: mongoose.Types.ObjectId;
    month: string;
    views: number;
    ratePerView: number;
    grossAmount: number;
    paid: boolean;
    razorpayPayoutId?: string;
}
export declare const TeacherEarning: mongoose.Model<ITeacherEarning, {}, {}, {}, mongoose.Document<unknown, {}, ITeacherEarning, {}, {}> & ITeacherEarning & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=TeacherEarning.d.ts.map