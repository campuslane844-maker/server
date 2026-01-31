import mongoose, { Document } from 'mongoose';
export interface ISubject extends Document {
    name: string;
    description?: string;
    classId: mongoose.Types.ObjectId;
    thumbnailKey: string;
    isDeleted?: boolean;
    deletedAt?: Date;
    deletedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    __v?: number;
}
export declare const Subject: mongoose.Model<ISubject, {}, {}, {}, mongoose.Document<unknown, {}, ISubject, {}, {}> & ISubject & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
//# sourceMappingURL=Subject.d.ts.map