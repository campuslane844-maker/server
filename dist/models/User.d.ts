import mongoose, { Document } from "mongoose";
import { UserRole, ApprovalStatus } from "../types";
export interface IUser extends Document {
    name: string;
    email: string;
    phone?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    role: UserRole;
    googleId?: string;
    age?: number;
    classLevel?: mongoose.Types.ObjectId;
    classOther?: string;
    studentCode?: string;
    approvalStatus?: ApprovalStatus;
    upiId?: string;
    referralCode?: string;
    referredBy?: mongoose.Types.ObjectId;
    isDeleted?: boolean;
    deletedAt?: Date;
    deletedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    __v?: number;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
//# sourceMappingURL=User.d.ts.map