import mongoose, { Document } from "mongoose";
export interface IPlatformConfig extends Document {
    payPerView: number;
}
export declare const PlatformConfig: mongoose.Model<IPlatformConfig, {}, {}, {}, mongoose.Document<unknown, {}, IPlatformConfig, {}, {}> & IPlatformConfig & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=PlatformConfig.d.ts.map