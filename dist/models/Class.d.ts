import mongoose, { Document } from 'mongoose';
export interface IClass extends Document {
    name: string;
    description?: string;
    thumbnailKey: string;
    isDeleted?: boolean;
    deletedAt?: Date;
    deletedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    __v?: number;
}
export declare const Class: mongoose.Model<IClass, {}, {}, {}, mongoose.Document<unknown, {}, IClass, {}, {}> & IClass & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
//# sourceMappingURL=Class.d.ts.map