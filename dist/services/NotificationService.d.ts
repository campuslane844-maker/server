import { UserRole } from '../types';
import mongoose from 'mongoose';
export declare class NotificationService {
    static createNotification(data: {
        userId: mongoose.Types.ObjectId;
        role: UserRole;
        type: string;
        title: string;
        body: string;
        meta?: Record<string, any>;
    }): Promise<mongoose.Document<unknown, {}, import("../models/Notification").INotification, {}, {}> & import("../models/Notification").INotification & Required<{
        _id: mongoose.Types.ObjectId;
    }>>;
    static notifyTeacherSignup(teacherId: mongoose.Types.ObjectId, teacherName: string): Promise<void>;
    static notifyContentSubmission(contentId: mongoose.Types.ObjectId, contentTitle: string): Promise<void>;
    static notifyParentLinkRequest(studentId: mongoose.Types.ObjectId, parentName: string, linkId: mongoose.Types.ObjectId): Promise<void>;
    static notifyOrderStatusUpdate(userId: mongoose.Types.ObjectId, orderId: mongoose.Types.ObjectId, status: string): Promise<void>;
}
//# sourceMappingURL=NotificationService.d.ts.map