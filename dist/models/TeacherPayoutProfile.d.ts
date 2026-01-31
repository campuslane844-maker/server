import mongoose, { Document } from "mongoose";
export interface ITeacherPayoutProfile extends Document {
    teacherId: mongoose.Types.ObjectId;
    contactId: string;
    fundAccountId: string;
    method: "bank" | "upi";
    active: boolean;
}
export declare const TeacherPayoutProfile: mongoose.Model<ITeacherPayoutProfile, {}, {}, {}, mongoose.Document<unknown, {}, ITeacherPayoutProfile, {}, {}> & ITeacherPayoutProfile & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=TeacherPayoutProfile.d.ts.map