import mongoose, { Document } from 'mongoose';
export interface IWishlist extends Document {
    userId: mongoose.Types.ObjectId;
    contents: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    __v?: number;
}
export declare const Bookmark: mongoose.Model<IWishlist, {}, {}, {}, mongoose.Document<unknown, {}, IWishlist, {}, {}> & IWishlist & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
//# sourceMappingURL=Bookmark.d.ts.map