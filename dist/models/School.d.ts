import mongoose, { Document } from 'mongoose';
export interface ISchool extends Document {
    name: string;
    logo?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    isDeleted?: boolean;
    deletedAt?: Date;
    deletedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    __v?: number;
}
export declare const School: mongoose.Model<ISchool, {}, {}, {}, mongoose.Document<unknown, {}, ISchool, {}, {}> & ISchool & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
//# sourceMappingURL=School.d.ts.map