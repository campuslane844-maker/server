import mongoose, { Document } from "mongoose";
export interface IReferral extends Document {
    referrer: mongoose.Types.ObjectId;
    referee: mongoose.Types.ObjectId;
    rewardGranted: boolean;
    createdAt: Date;
}
export declare const Referral: mongoose.Model<IReferral, {}, {}, {}, mongoose.Document<unknown, {}, IReferral, {}, {}> & IReferral & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Referral.d.ts.map