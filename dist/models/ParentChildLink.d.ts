import mongoose, { Document } from 'mongoose';
import { ApprovalStatus } from '../types';
export interface IParentChildLink extends Document {
    parentId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    studentCode: string;
    status: ApprovalStatus;
    requestedAt: Date;
    respondedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    __v?: number;
}
export declare const ParentChildLink: mongoose.Model<IParentChildLink, {}, {}, {}, mongoose.Document<unknown, {}, IParentChildLink, {}, {}> & IParentChildLink & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
//# sourceMappingURL=ParentChildLink.d.ts.map