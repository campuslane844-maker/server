"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentChildController = void 0;
const ParentChildLink_1 = require("../models/ParentChildLink");
const User_1 = require("../models/User");
const asyncHandler_1 = require("../utils/asyncHandler");
const errors_1 = require("../utils/errors");
const NotificationService_1 = require("../services/NotificationService");
class ParentChildController {
}
exports.ParentChildController = ParentChildController;
_a = ParentChildController;
ParentChildController.createLink = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { childId, studentCode } = req.body;
    const parentId = req.user._id;
    let child;
    if (childId) {
        child = await User_1.User.findOne({ _id: childId, role: "student", isDeleted: false }).select("name age grade studentCode");
    }
    else if (studentCode) {
        child = await User_1.User.findOne({ studentCode, role: "student", isDeleted: false }).select("name age grade studentCode");
    }
    else {
        throw new errors_1.ValidationError("Either childId or studentCode is required");
    }
    if (!child) {
        throw new errors_1.NotFoundError("Student not found");
    }
    // Check if link already exists
    const existingLink = await ParentChildLink_1.ParentChildLink.findOne({
        parentId,
        studentId: child._id,
    });
    if (existingLink) {
        if (existingLink.status === "approved") {
            throw new errors_1.ValidationError("Link already exists and is approved");
        }
        else if (existingLink.status === "pending") {
            throw new errors_1.ValidationError("Link request is already pending");
        }
        else {
            // Rejected - allow new request
            existingLink.status = "pending";
            existingLink.requestedAt = new Date();
            existingLink.respondedAt = undefined;
            await existingLink.save();
            await NotificationService_1.NotificationService.notifyParentLinkRequest(child._id, req.user.name, existingLink._id);
            return res.status(200).json({
                success: true,
                data: {
                    link: existingLink,
                    student: {
                        name: child.name,
                        age: child.age,
                        studentCode: child.studentCode,
                    },
                },
                message: "Link request sent again",
            });
        }
    }
    else {
        // Create new link request
        const link = new ParentChildLink_1.ParentChildLink({
            parentId,
            studentId: child._id,
            studentCode: child.studentCode,
            status: "pending",
            requestedAt: new Date(),
        });
        await link.save();
        await NotificationService_1.NotificationService.notifyParentLinkRequest(child._id, req.user.name, link._id);
        return res.status(201).json({
            success: true,
            data: {
                link,
                student: {
                    name: child.name,
                    age: child.age,
                    studentCode: child.studentCode,
                },
            },
            message: "Link request sent successfully",
        });
    }
});
ParentChildController.getPendingLinks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const studentId = req.user._id;
    let links = await ParentChildLink_1.ParentChildLink.find({
        studentId,
        status: 'pending',
    }).populate('parentId', 'name email phone');
    if (links.length === 0) {
        const parentId = req.user._id;
        links = await ParentChildLink_1.ParentChildLink.find({
            parentId,
            status: 'pending',
        }).populate('studentId', 'name email phone');
    }
    res.status(200).json({
        success: true,
        data: links,
    });
});
ParentChildController.approveLink = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const studentId = req.user._id;
    const link = await ParentChildLink_1.ParentChildLink.findOne({
        _id: id,
        studentId,
        status: 'pending',
    });
    if (!link) {
        throw new errors_1.NotFoundError('Link request not found');
    }
    link.status = 'approved';
    link.respondedAt = new Date();
    await link.save();
    res.status(200).json({
        success: true,
        data: link,
        message: 'Link approved successfully',
    });
});
ParentChildController.rejectLink = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const studentId = req.user._id;
    const link = await ParentChildLink_1.ParentChildLink.findOne({
        _id: id,
        studentId,
        status: 'pending',
    });
    if (!link) {
        throw new errors_1.NotFoundError('Link request not found');
    }
    link.status = 'rejected';
    link.respondedAt = new Date();
    await link.save();
    res.status(200).json({
        success: true,
        data: link,
        message: 'Link rejected successfully',
    });
});
ParentChildController.deleteLink = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const link = await ParentChildLink_1.ParentChildLink.findOneAndDelete({
        _id: id,
    });
    if (!link) {
        throw new errors_1.NotFoundError('Link not found');
    }
    res.status(200).json({
        success: true,
        message: 'Link deleted successfully',
    });
});
ParentChildController.getParentLinks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const parentId = req.user._id;
    const links = await ParentChildLink_1.ParentChildLink.find({
        parentId,
        status: 'approved',
    }).populate('studentId', 'name email age studentCode');
    res.status(200).json({
        success: true,
        data: links,
    });
});
//# sourceMappingURL=ParentChildController.js.map