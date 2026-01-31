import mongoose, { Document } from 'mongoose';
export interface ICategory extends Document {
    name: string;
    description?: string;
    image?: string;
    isDeleted?: boolean;
    deletedAt?: Date;
    deletedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    __v?: number;
}
export declare const Category: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory, {}, {}> & ICategory & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
//# sourceMappingURL=Category.d.ts.map