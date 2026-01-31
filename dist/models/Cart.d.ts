import mongoose, { Document } from 'mongoose';
export interface ICartItem {
    productId: mongoose.Types.ObjectId;
    variantId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}
export interface ICart extends Document {
    userId: mongoose.Types.ObjectId;
    items: ICartItem[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Cart: mongoose.Model<ICart, {}, {}, {}, mongoose.Document<unknown, {}, ICart, {}, {}> & ICart & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Cart.d.ts.map