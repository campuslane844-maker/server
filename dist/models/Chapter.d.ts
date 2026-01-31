import mongoose, { Document } from 'mongoose';
export interface IChapter extends Document {
    name: string;
    description?: string;
    subjectId: mongoose.Types.ObjectId;
    thumbnailKey: string;
    order: number;
    isDeleted?: boolean;
    deletedAt?: Date;
    deletedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    __v?: number;
}
export declare const Chapter: mongoose.Model<IChapter, {}, {}, {}, mongoose.Document<unknown, {}, IChapter, {}, {}> & IChapter & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
//# sourceMappingURL=Chapter.d.ts.map