import mongoose, { Document } from "mongoose";
export interface IFeeConfig extends Document {
    amount: number;
    currency: string;
}
export declare const FeeConfig: mongoose.Model<{
    amount: number;
    currency: string;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    amount: number;
    currency: string;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    amount: number;
    currency: string;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    amount: number;
    currency: string;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    amount: number;
    currency: string;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    amount: number;
    currency: string;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=FeeConfig.d.ts.map