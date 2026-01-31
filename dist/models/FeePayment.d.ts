import mongoose, { Document } from "mongoose";
export interface IFeePayment extends Document {
    userId: mongoose.Types.ObjectId;
    studentInfo: {
        name: string;
        className: string;
        schoolName?: string;
        phone: string;
        address: {
            street?: string;
            city?: string;
            state?: string;
            pin?: string;
        };
    };
    month: number;
    year: number;
    amount: number;
    status: "Paid" | "Pending";
    paidAt?: Date;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
}
export declare const FeePayment: mongoose.Model<IFeePayment, {}, {}, {}, mongoose.Document<unknown, {}, IFeePayment, {}, {}> & IFeePayment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=FeePayment.d.ts.map