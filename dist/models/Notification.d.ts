import mongoose, { Document } from 'mongoose';
import { UserRole } from '../types';
export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    role: UserRole;
    type: string;
    title: string;
    body: string;
    isRead: boolean;
    meta?: Record<string, any>;
    isDeleted?: boolean;
    deletedAt?: Date;
    deletedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    __v?: number;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
//# sourceMappingURL=Notification.d.ts.map