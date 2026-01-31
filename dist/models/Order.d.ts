import mongoose, { Document } from "mongoose";
import { OrderStatus, PaymentType, PaymentStatus } from "../types";
export interface IVariantItem {
    name: string;
    price: number;
    images: string[];
}
export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    variantId: string;
    quantity: number;
    price: number;
    variant: IVariantItem;
}
export interface IShippingAddress {
    name: string;
    phone: string;
    street: string;
    streetOptional?: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
}
export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    status: OrderStatus;
    shippingAddress: IShippingAddress;
    paymentType: PaymentType;
    paymentStatus: PaymentStatus;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    deliveryRate: number;
    freeShipping: boolean;
    createdAt: Date;
    updatedAt: Date;
    __v?: number;
}
export declare const Order: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
//# sourceMappingURL=Order.d.ts.map