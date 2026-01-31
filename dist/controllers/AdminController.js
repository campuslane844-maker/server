"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePayPerView = exports.AdminController = void 0;
const User_1 = require("../models/User");
const Content_1 = require("../models/Content");
const aws_1 = require("../config/aws");
const asyncHandler_1 = require("../utils/asyncHandler");
const errors_1 = require("../utils/errors");
const pagination_1 = require("../utils/pagination");
const ParentChildLink_1 = require("../models/ParentChildLink");
const TeacherPlan_1 = require("../models/TeacherPlan");
const TeacherSubscription_1 = require("../models/TeacherSubscription");
const TeacherSubscriptionController_1 = require("./TeacherSubscriptionController");
const PaymentService_1 = require("../services/PaymentService");
const TeacherPayoutProfile_1 = require("../models/TeacherPayoutProfile");
const PlatformConfig_1 = require("../models/PlatformConfig");
const Referral_1 = require("../models/Referral");
const MAX_REFERRAL_REWARDS = 3;
class AdminController {
}
exports.AdminController = AdminController;
_a = AdminController;
AdminController.getTeachers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { status, search, page, limit } = req.query;
    const { skip } = (0, pagination_1.getPaginationParams)(req.query);
    const filter = {
        role: "teacher",
        isDeleted: false,
    };
    if (status) {
        filter.approvalStatus = status;
    }
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }
    const [teachers, total] = await Promise.all([
        User_1.User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User_1.User.countDocuments(filter),
    ]);
    const result = (0, pagination_1.createPaginationResult)(teachers, total, page, limit);
    res.status(200).json({
        success: true,
        ...result,
    });
});
AdminController.getTeacherById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const teacher = await User_1.User.findById(id);
    const content = await Content_1.Content.find({
        uploaderId: id,
        isDeleted: false,
    });
    if (!teacher) {
        throw new errors_1.NotFoundError("Teacher not found");
    }
    res.status(200).json({
        success: true,
        data: {
            teacher,
            content,
        },
    });
});
AdminController.updateTeacher = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const teacher = await User_1.User.findOneAndUpdate({ _id: id, isDeleted: false }, req.body, { new: true, runValidators: true });
    if (!teacher) {
        throw new errors_1.NotFoundError("Teacher not found");
    }
    res.status(200).json({
        success: true,
        data: teacher,
    });
});
AdminController.deleteTeacher = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const teacher = await User_1.User.findById(id);
    if (!teacher || teacher.isDeleted) {
        return res
            .status(404)
            .json({ success: false, message: "Student not found" });
    }
    // Soft delete
    teacher.isDeleted = true;
    await teacher.save();
    return res
        .status(200)
        .json({ success: true, message: "Teacher deleted successfully" });
});
AdminController.approveTeacher = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    // Fetch teacher (NOT update yet)
    const teacher = await User_1.User.findOne({
        _id: id,
        role: "teacher",
        isDeleted: false,
        approvalStatus: { $ne: "approved" },
    });
    if (!teacher) {
        throw new Error("Teacher already approved or not found");
    }
    if (!teacher.upiId) {
        throw new Error("Teacher UPI ID not provided");
    }
    // Create Razorpay Contact
    let contact;
    try {
        contact = await (0, PaymentService_1.createRazorpayContact)({
            name: teacher.name,
            email: teacher.email,
            contact: teacher.phone,
            referenceId: `teacher_${teacher._id}`,
        });
        console.log(contact);
    }
    catch (err) {
        console.error("RAZORPAY FUND ACCOUNT ERROR", err?.error || err);
        throw new Error("Failed to create Razorpay contact");
    }
    // Create UPI Fund Account
    let fundAccount;
    try {
        fundAccount = await (0, PaymentService_1.createUpiFundAccount)({
            contactId: contact.id,
            upiId: teacher.upiId,
        });
        console.log(fundAccount);
    }
    catch (err) {
        throw new Error("Invalid UPI ID. Please ask teacher to update.");
    }
    // Save payout profile (idempotent)
    await TeacherPayoutProfile_1.TeacherPayoutProfile.updateOne({ teacherId: teacher._id }, {
        teacherId: teacher._id,
        contactId: contact.id,
        fundAccountId: fundAccount.id,
        method: "upi",
        active: true,
    }, { upsert: true });
    // Approve teacher
    teacher.approvalStatus = "approved";
    await teacher.save();
    // Assign FREE plan
    const freePlan = await TeacherPlan_1.TeacherPlan.findOne({
        code: "free",
        isActive: true,
    });
    if (!freePlan) {
        throw new Error("Free plan not configured");
    }
    const now = new Date();
    await TeacherSubscription_1.TeacherSubscription.updateOne({ teacherId: teacher._id, isFree: true }, {
        $setOnInsert: {
            planCode: "free",
            uploadLimit: freePlan.uploadLimit,
            uploadsUsed: 0,
            isFree: true,
            status: "active",
            startDate: new Date(),
            endDate: new Date(now.setDate(now.getDate() + (freePlan.durationDays ?? 0))),
        },
    }, { upsert: true });
    // REFERRAL REWARD LOGIC (after approval)
    const referral = await Referral_1.Referral.findOne({
        referee: teacher._id,
        rewardGranted: false,
    });
    if (referral) {
        // Count already rewarded referrals for this referrer
        const rewardedCount = await Referral_1.Referral.countDocuments({
            referrer: referral.referrer,
            rewardGranted: true,
        });
        // Cap check
        if (rewardedCount >= MAX_REFERRAL_REWARDS) {
            console.log(`[REFERRAL] Reward cap reached for referrer ${referral.referrer}`);
        }
        else {
            const referrerSubscription = await TeacherSubscription_1.TeacherSubscription.findOne({
                teacherId: referral.referrer,
                status: "active",
            });
            if (referrerSubscription &&
                referrerSubscription.uploadLimit !== null) {
                referrerSubscription.uploadLimit += 10;
                await referrerSubscription.save();
            }
            referral.rewardGranted = true;
            await referral.save();
            console.log(`[REFERRAL] Reward granted (${rewardedCount + 1}/${MAX_REFERRAL_REWARDS})`);
        }
    }
    res.status(200).json({
        success: true,
        data: teacher,
        message: "Teacher approved and payout setup completed",
    });
});
AdminController.rejectTeacher = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { feedback } = req.body;
    const teacher = await User_1.User.findOneAndUpdate({ _id: id, role: "teacher", isDeleted: false }, { approvalStatus: "rejected", feedback }, { new: true });
    if (!teacher) {
        throw new errors_1.NotFoundError("Teacher not found");
    }
    res.status(200).json({
        success: true,
        data: teacher,
        message: "Teacher rejected successfully",
    });
});
AdminController.getContentForApproval = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { approvalStatus, classId, subjectId, chapterId, q, page, limit, includeDeleted, } = req.query;
    const { skip } = (0, pagination_1.getPaginationParams)(req.query);
    const filter = {};
    if (!includeDeleted) {
        filter.isDeleted = false;
    }
    if (approvalStatus)
        filter.approvalStatus = approvalStatus;
    if (classId)
        filter.classId = classId;
    if (subjectId)
        filter.subjectId = subjectId;
    if (chapterId)
        filter.chapterId = chapterId;
    if (q) {
        filter.$text = { $search: q };
    }
    const [content, total] = await Promise.all([
        Content_1.Content.find(filter)
            .populate("classId", "name")
            .populate("subjectId", "name")
            .populate("chapterId", "name")
            .populate("uploaderId", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Content_1.Content.countDocuments(filter),
    ]);
    const result = (0, pagination_1.createPaginationResult)(content, total, page, limit);
    res.status(200).json({
        success: true,
        ...result,
    });
});
AdminController.approveContent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { feedback } = req.body;
    const content = await Content_1.Content.findOneAndUpdate({
        _id: id,
        isDeleted: false,
        approvalStatus: { $ne: "approved" }, // idempotent
    }, {
        approvalStatus: "approved",
        feedback,
        approvedAt: new Date(),
    }, { new: true });
    if (!content) {
        throw new Error("Content already approved or not found");
    }
    /**
     * Increment upload count ONLY for teacher content
     * using unified subscription resolution
     */
    if (content.uploaderRole === "teacher") {
        try {
            const subscription = await (0, TeacherSubscriptionController_1.assertTeacherCanUpload)(content.uploaderId.toString());
            await TeacherSubscription_1.TeacherSubscription.updateOne({ _id: subscription._id }, { $inc: { uploadsUsed: 1 } });
        }
        catch (err) {
            if (err.message === "Upload limit reached") {
                await Content_1.Content.updateOne({ _id: content._id }, {
                    approvalStatus: "rejected",
                    feedback: "Upload limit exceeded. Please upgrade plan.",
                });
            }
            throw err;
        }
    }
    res.status(200).json({
        success: true,
        data: content,
        message: "Content approved successfully",
    });
});
AdminController.rejectContent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { feedback } = req.body;
    const content = await Content_1.Content.findOneAndUpdate({ _id: id, isDeleted: false }, { approvalStatus: "rejected", feedback }, { new: true });
    if (!content) {
        throw new errors_1.NotFoundError("Content not found");
    }
    res.status(200).json({
        success: true,
        data: content,
        message: "Content rejected successfully",
    });
});
AdminController.getStudents = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { search, page, limit } = req.query;
    const { skip } = (0, pagination_1.getPaginationParams)(req.query);
    const filter = {
        role: "student",
        isDeleted: false,
    };
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }
    const [students, total] = await Promise.all([
        User_1.User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User_1.User.countDocuments(filter),
    ]);
    const result = (0, pagination_1.createPaginationResult)(students, total, page, limit);
    res.status(200).json({
        success: true,
        ...result,
    });
});
AdminController.getStudentById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const student = await User_1.User.findById(id);
    res.status(200).json({
        success: true,
        data: student,
    });
});
AdminController.updateStudent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const student = await User_1.User.findOneAndUpdate({ _id: id, isDeleted: false }, req.body, { new: true, runValidators: true });
    if (!student) {
        throw new errors_1.NotFoundError("Student not found");
    }
    res.status(200).json({
        success: true,
        data: student,
    });
});
AdminController.deleteStudent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const student = await User_1.User.findById(id);
    if (!student || student.isDeleted) {
        return res
            .status(404)
            .json({ success: false, message: "Student not found" });
    }
    // Soft delete
    student.isDeleted = true;
    await student.save();
    return res
        .status(200)
        .json({ success: true, message: "Student deleted successfully" });
});
AdminController.getParents = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { search, page, limit } = req.query;
    const { skip } = (0, pagination_1.getPaginationParams)(req.query);
    const filter = {
        role: "parent",
        isDeleted: false,
    };
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }
    const [parents, total] = await Promise.all([
        User_1.User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User_1.User.countDocuments(filter),
    ]);
    const result = (0, pagination_1.createPaginationResult)(parents, total, page, limit);
    res.status(200).json({
        success: true,
        ...result,
    });
});
AdminController.getParentById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const parent = await User_1.User.findById(id);
    if (!parent) {
        throw new errors_1.NotFoundError("Parent not found");
    }
    const parentChildLinks = await ParentChildLink_1.ParentChildLink.find({
        parentId: id,
    }).populate("studentId");
    const children = parentChildLinks.map((item) => {
        return item.studentId;
    });
    res.status(200).json({
        success: true,
        data: {
            parent,
            children,
        },
    });
});
AdminController.updateParent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const parent = await User_1.User.findOneAndUpdate({ _id: id, isDeleted: false }, req.body, { new: true, runValidators: true });
    if (!parent) {
        throw new errors_1.NotFoundError("Parent not found");
    }
    res.status(200).json({
        success: true,
        data: parent,
    });
});
AdminController.deleteParent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const parent = await User_1.User.findById(id);
    if (!parent || parent.isDeleted) {
        return res
            .status(404)
            .json({ success: false, message: "Parent not found" });
    }
    // Soft delete
    parent.isDeleted = true;
    await parent.save();
    return res
        .status(200)
        .json({ success: true, message: "Parent deleted successfully" });
});
AdminController.generatePresignedUrl = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { contentType } = req.body;
    // Validate content type
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/webm",
        "video/mp3",
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "video/quicktime",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];
    if (!allowedTypes.includes(contentType)) {
        throw new errors_1.ValidationError("Unsupported file type");
    }
    // Generate unique key
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const key = `uploads/${timestamp}-${randomString}`;
    const presignedData = await (0, aws_1.generatePresignedUrl)(key, contentType);
    res.status(200).json({
        success: true,
        data: presignedData,
    });
});
exports.updatePayPerView = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { payPerView } = req.body;
    if (payPerView < 0) {
        throw new Error("Invalid pay per view");
    }
    const config = await PlatformConfig_1.PlatformConfig.findOneAndUpdate({}, { payPerView }, { new: true, upsert: true });
    res.json({
        success: true,
        data: config,
    });
});
//# sourceMappingURL=AdminController.js.map