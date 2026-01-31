"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const Notification_1 = require("../models/Notification");
const asyncHandler_1 = require("../utils/asyncHandler");
const errors_1 = require("../utils/errors");
const pagination_1 = require("../utils/pagination");
class NotificationController {
}
exports.NotificationController = NotificationController;
_a = NotificationController;
NotificationController.getNotifications = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { page, limit } = req.query;
    const { skip } = (0, pagination_1.getPaginationParams)(req.query);
    const userId = req.admin._id;
    const filter = {
        userId,
        isDeleted: false
    };
    const [notifications, total] = await Promise.all([
        Notification_1.Notification.find(filter)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit),
        Notification_1.Notification.countDocuments(filter),
    ]);
    const result = (0, pagination_1.createPaginationResult)(notifications, total, page, limit);
    res.status(200).json({
        success: true,
        ...result,
    });
});
NotificationController.markAsRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.admin._id;
    const notification = await Notification_1.Notification.findOneAndUpdate({ _id: id, userId, isDeleted: false }, { isRead: true }, { new: true });
    if (!notification) {
        throw new errors_1.NotFoundError('Notification not found');
    }
    res.status(200).json({
        success: true,
        data: notification,
    });
});
NotificationController.deleteNotification = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.admin._id;
    const notification = await Notification_1.Notification.findOneAndUpdate({ _id: id, userId, isDeleted: false }, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId
    }, { new: true });
    if (!notification) {
        throw new errors_1.NotFoundError('Notification not found');
    }
    res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
    });
});
//# sourceMappingURL=NotificationController.js.map