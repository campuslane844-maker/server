import mongoose, { Document } from "mongoose";
export interface IContentView extends Document {
    contentId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    viewedAt: Date;
}
export declare const ContentView: mongoose.Model<IContentView, {}, {}, {}, mongoose.Document<unknown, {}, IContentView, {}, {}> & IContentView & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ContentView.d.ts.map