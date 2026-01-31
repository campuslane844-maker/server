import mongoose, { Document } from 'mongoose';
export interface IReview extends Document {
    productId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
    isDeleted?: boolean;
    deletedAt?: Date;
    deletedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    __v?: number;
}
export declare const Review: mongoose.Model<IReview, {}, {}, {}, mongoose.Document<unknown, {}, IReview, {}, {}> & IReview & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
//# sourceMappingURL=Review.d.ts.map