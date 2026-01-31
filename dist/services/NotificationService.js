"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const Admin_1 = require("../models/Admin");
const Notification_1 = require("../models/Notification");
const User_1 = require("../models/User");
class NotificationService {
    static async createNotification(data) {
        try {
            const notification = new Notification_1.Notification(data);
            await notification.save();
            return notification;
        }
        catch (error) {
            console.error('Failed to create notification:', error);
            throw error;
        }
    }
    static async notifyTeacherSignup(teacherId, teacherName) {
        const admins = await Admin_1.Admin.find().lean();
        const notifications = admins.map((admin) => ({
            userId: admin._id,
            role: 'admin',
            type: 'teacher_signup',
            title: 'New Teacher Registration',
            body: `${teacherName} has signed up as a teacher and is pending approval`,
            meta: { teacherId },
        }));
        console.log(admins);
        if (notifications.length > 0) {
            await Notification_1.Notification.insertMany(notifications);
        }
    }
    static async notifyContentSubmission(contentId, contentTitle) {
        const admins = await User_1.User.find({ role: "admin" }).lean();
        for (const admin of admins) {
            await Notification_1.Notification.findOneAndUpdate({
                userId: admin._id,
                role: "admin",
                "meta.contentId": contentId,
            }, {
                $set: {
                    type: "content_pending",
                    title: "Content Pending Approval",
                    body: `Content "${contentTitle}" is pending approval`,
                    meta: { contentId },
                    updatedAt: new Date(),
                },
            }, { upsert: true, new: true });
        }
    }
    static async notifyParentLinkRequest(studentId, parentName, linkId) {
        await this.createNotification({
            userId: studentId,
            role: 'student',
            type: 'parent_link_request',
            title: 'Parent Link Request',
            body: `${parentName} wants to link to your account`,
            meta: { linkId },
        });
    }
    static async notifyOrderStatusUpdate(userId, orderId, status) {
        const user = await User_1.User.findById(userId).lean();
        await this.createNotification({
            userId,
            role: user?.role || 'parent',
            type: 'order_status',
            title: 'Order Update',
            body: `Your order status has been updated to: ${status}`,
            meta: { orderId, status },
        });
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=NotificationService.js.map