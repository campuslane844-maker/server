import mongoose, { Document } from 'mongoose';
import { Gender } from '../types';
/**
 * Product Variant Model
 */
export interface IVariant extends Document {
    product: mongoose.Types.ObjectId;
    name: string;
    price: number;
    cutoffPrice?: number;
    stock: number;
    images?: string[];
    id: string;
    createdAt: Date;
    updatedAt: Date;
    __v?: any;
}
export declare const Variant: mongoose.Model<IVariant, {}, {}, {}, mongoose.Document<unknown, {}, IVariant, {}, {}> & IVariant & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
/**
 * Product Model
 */
export interface IProduct extends Document {
    name: string;
    description?: string;
    category: mongoose.Types.ObjectId;
    images: string[];
    school?: mongoose.Types.ObjectId;
    gender?: Gender;
    classLevel?: mongoose.Types.ObjectId;
    subject?: string;
    brand?: string;
    type?: string;
    isActive: boolean;
    isDeleted?: boolean;
    deletedAt?: Date;
    deletedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    __v?: number;
}
export declare const Product: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, {}> & IProduct & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
//# sourceMappingURL=Product.d.ts.map