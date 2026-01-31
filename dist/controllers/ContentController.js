"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentController = void 0;
const Class_1 = require("../models/Class");
const Subject_1 = require("../models/Subject");
const Chapter_1 = require("../models/Chapter");
const Content_1 = require("../models/Content");
const asyncHandler_1 = require("../utils/asyncHandler");
const errors_1 = require("../utils/errors");
const pagination_1 = require("../utils/pagination");
const NotificationService_1 = require("../services/NotificationService");
const mongoose_1 = __importDefault(require("mongoose"));
const Bookmark_1 = require("../models/Bookmark");
const Progress_1 = require("../models/Progress");
const TeacherSubscriptionController_1 = require("../controllers/TeacherSubscriptionController");
class ContentController {
}
exports.ContentController = ContentController;
_a = ContentController;
// Classes
ContentController.getClasses = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { page, limit } = req.query;
    const { skip } = (0, pagination_1.getPaginationParams)(req.query);
    const [classes, total] = await Promise.all([
        Class_1.Class.find({ isDeleted: false })
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit),
        Class_1.Class.countDocuments(),
    ]);
    const result = (0, pagination_1.createPaginationResult)(classes, total, page, limit);
    res.status(200).json({
        success: true,
        ...result,
    });
});
ContentController.getClassById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.query;
    const classData = await Class_1.Class.findById(id);
    res.status(200).json({
        success: true,
        ...classData,
    });
});
ContentController.createClass = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const classData = new Class_1.Class(req.body);
    await classData.save();
    res.status(201).json({
        success: true,
        data: classData,
    });
});
ContentController.updateClass = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const classData = await Class_1.Class.findOneAndUpdate({ _id: id, isDeleted: false }, req.body, { new: true, runValidators: true });
    if (!classData) {
        throw new errors_1.NotFoundError("Class not found");
    }
    res.status(200).json({
        success: true,
        data: classData,
    });
});
ContentController.deleteClass = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const classData = await Class_1.Class.findOneAndUpdate({ _id: id, isDeleted: false }, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user?._id || req.admin?._id,
    }, { new: true });
    if (!classData) {
        throw new errors_1.NotFoundError("Class not found");
    }
    res.status(200).json({
        success: true,
        message: "Class deleted successfully",
    });
});
// Subjects
ContentController.getSubjects = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { classId } = req.query;
    const filter = { isDeleted: false };
    if (classId) {
        filter.classId = classId;
    }
    const subjects = await Subject_1.Subject.find(filter);
    res.status(200).json({
        success: true,
        data: subjects,
    });
});
ContentController.getSubjectById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.query;
    const subjectData = await Subject_1.Subject.findById(id);
    res.status(200).json({
        success: true,
        ...subjectData,
    });
});
ContentController.createSubject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const subject = new Subject_1.Subject(req.body);
    await subject.save();
    res.status(201).json({
        success: true,
        data: subject,
    });
});
ContentController.updateSubject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const subject = await Subject_1.Subject.findOneAndUpdate({ _id: id, isDeleted: false }, req.body, { new: true, runValidators: true });
    if (!subject) {
        throw new errors_1.NotFoundError("Subject not found");
    }
    res.status(200).json({
        success: true,
        data: subject,
    });
});
ContentController.deleteSubject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const subject = await Subject_1.Subject.findOneAndUpdate({ _id: id, isDeleted: false }, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user?._id || req.admin?._id,
    }, { new: true });
    if (!subject) {
        throw new errors_1.NotFoundError("Subject not found");
    }
    res.status(200).json({
        success: true,
        message: "Subject deleted successfully",
    });
});
// Chapters
ContentController.getChapters = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { subjectId } = req.query;
    const filter = { isDeleted: false };
    if (subjectId) {
        filter.subjectId = subjectId;
    }
    const chapters = await Chapter_1.Chapter.find(filter);
    res.status(200).json({
        success: true,
        data: chapters,
    });
});
ContentController.getChapterById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.query;
    const chapterData = await Chapter_1.Chapter.find({ _id: id });
    res.status(200).json({
        success: true,
        ...chapterData,
    });
});
ContentController.createChapter = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const chapter = new Chapter_1.Chapter(req.body);
    await chapter.save();
    res.status(201).json({
        success: true,
        data: chapter,
    });
});
ContentController.updateChapter = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const chapter = await Chapter_1.Chapter.findOneAndUpdate({ _id: id, isDeleted: false }, req.body, { new: true, runValidators: true });
    if (!chapter) {
        throw new errors_1.NotFoundError("Chapter not found");
    }
    res.status(200).json({
        success: true,
        data: chapter,
    });
});
ContentController.deleteChapter = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const chapter = await Chapter_1.Chapter.findOneAndUpdate({ _id: id, isDeleted: false }, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user?._id || req.admin?._id,
    }, { new: true });
    if (!chapter) {
        throw new errors_1.NotFoundError("Chapter not found");
    }
    res.status(200).json({
        success: true,
        message: "Chapter deleted successfully",
    });
});
// Content
ContentController.getContent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { classId, subjectId, chapterId, type, paid, approvalStatus, isAdminContent, search, page, limit, includeDeleted, } = req.query;
    const { skip } = (0, pagination_1.getPaginationParams)(req.query);
    const filter = {};
    if (!includeDeleted) {
        filter.isDeleted = false;
    }
    if (classId)
        filter.classId = classId;
    if (subjectId)
        filter.subjectId = subjectId;
    if (chapterId)
        filter.chapterId = chapterId;
    if (typeof isAdminContent !== "undefined") {
        filter.isAdminContent = isAdminContent === "true";
    }
    if (type)
        filter.type = type;
    if (paid != undefined) {
        if (paid === "true")
            filter.paid = paid;
        else
            filter.paid = false;
    }
    // Handle approval status filter
    if (req.user?.role === "student" || req.user?.role === "parent") {
        filter.approvalStatus = "approved";
    }
    else if (approvalStatus) {
        filter.approvalStatus = approvalStatus;
    }
    // Add text search
    if (search) {
        filter.$text = { $search: search };
    }
    // Use lean to simplify typing
    const [content, total] = await Promise.all([
        Content_1.Content.find(filter)
            .populate("classId", "name")
            .populate("subjectId", "name")
            .populate("chapterId", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Content_1.Content.countDocuments(filter),
    ]);
    let contentWithProgress;
    if (req.user?.userId) {
        // user is logged in → fetch progress
        const progressDocs = await Progress_1.Progress.find({
            studentId: req.user.userId,
            contentId: { $in: content.map((c) => c._id) },
        }).lean();
        const progressMap = new Map(progressDocs.map((p) => [p.contentId.toString(), p]));
        contentWithProgress = content.map((c) => ({
            ...c,
            progress: progressMap.get(c._id.toString()) ||
                null,
        }));
    }
    else {
        // public (no user)
        contentWithProgress = content.map((c) => ({
            ...c,
            progress: null,
        }));
    }
    const result = (0, pagination_1.createPaginationResult)(contentWithProgress, total, page, limit);
    res.status(200).json({
        success: true,
        ...result,
    });
});
// Content
ContentController.getTeacherContent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { classId, subjectId, chapterId, type, approvalStatus, uploaderId, search, page, limit, includeDeleted, } = req.query;
    const { skip } = (0, pagination_1.getPaginationParams)(req.query);
    const filter = {};
    if (!includeDeleted) {
        filter.isDeleted = false;
    }
    if (classId)
        filter.classId = classId;
    if (subjectId)
        filter.subjectId = subjectId;
    if (chapterId)
        filter.chapterId = chapterId;
    if (type)
        filter.type = type;
    if (uploaderId)
        filter.uploaderId =
            mongoose_1.default.Types.ObjectId.createFromHexString(uploaderId);
    if (approvalStatus)
        filter.approvalStatus = approvalStatus;
    // Add text search
    if (search) {
        filter.$text = { $search: search };
    }
    const [content, total] = await Promise.all([
        Content_1.Content.find(filter)
            .populate("classId", "name")
            .populate("subjectId", "name")
            .populate("chapterId", "name")
            .sort({ updatedAt: -1 })
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
ContentController.getUserContent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { classId, subjectId, chapterId, type, paid, isAdminContent, search, page, limit, includeDeleted, } = req.query;
    const { skip } = (0, pagination_1.getPaginationParams)(req.query);
    const filter = {};
    if (!includeDeleted) {
        filter.isDeleted = false;
    }
    if (classId)
        filter.classId = classId;
    if (subjectId)
        filter.subjectId = subjectId;
    if (chapterId)
        filter.chapterId = chapterId;
    if (typeof isAdminContent !== "undefined") {
        filter.isAdminContent = isAdminContent === "true";
    }
    if (type)
        filter.type = type;
    if (paid != undefined) {
        if (paid === "true")
            filter.paid = paid;
        else
            filter.paid = false;
    }
    filter.approvalStatus = "approved";
    // Add text search
    if (search) {
        filter.$text = { $search: search };
    }
    // Use lean to simplify typing
    const [content, total] = await Promise.all([
        Content_1.Content.find(filter)
            .populate("classId", "name")
            .populate("subjectId", "name")
            .populate("chapterId", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Content_1.Content.countDocuments(filter),
    ]);
    let contentWithProgress;
    if (req.user?.userId) {
        // user is logged in → fetch progress
        const progressDocs = await Progress_1.Progress.find({
            studentId: req.user.userId,
            contentId: { $in: content.map((c) => c._id) },
        }).lean();
        const progressMap = new Map(progressDocs.map((p) => [p.contentId.toString(), p]));
        contentWithProgress = content.map((c) => ({
            ...c,
            progress: progressMap.get(c._id.toString()) ||
                null,
        }));
    }
    else {
        // public (no user)
        contentWithProgress = content.map((c) => ({
            ...c,
            progress: null,
        }));
    }
    const result = (0, pagination_1.createPaginationResult)(contentWithProgress, total, page, limit);
    res.status(200).json({
        success: true,
        ...result,
    });
});
ContentController.getContentById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const content = await Content_1.Content.findOne({ _id: id, isDeleted: false })
        .populate("classId", "name")
        .populate("subjectId", "name")
        .populate("chapterId", "name")
        .populate("uploaderId", "name email");
    if (!content) {
        throw new errors_1.NotFoundError("Content not found");
    }
    // Check permissions
    if (req.user?.role === "student" || req.user?.role === "parent") {
        if (content.approvalStatus !== "approved") {
            throw new errors_1.NotFoundError("Content not found");
        }
    }
    else if (req.user?.role === "teacher") {
        if (content.approvalStatus !== "approved") {
            throw new errors_1.NotFoundError("Content not found");
        }
    }
    res.status(200).json({
        success: true,
        data: content,
    });
});
ContentController.createContent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Upload guard — ONLY for teachers
    if (req.user?.role === "teacher") {
        await (0, TeacherSubscriptionController_1.assertTeacherCanUpload)(req.user._id);
    }
    const contentData = {
        ...req.body,
        uploaderId: req.user?._id || req.admin?._id,
        uploaderRole: req.user?.role || "admin",
    };
    const content = new Content_1.Content(contentData);
    await content.save();
    // Notify admins if teacher uploaded content
    if (req.user?.role === "teacher") {
        await NotificationService_1.NotificationService.notifyContentSubmission(content._id, content.title);
    }
    res.status(201).json({
        success: true,
        data: content,
    });
});
ContentController.updateContent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const content = await Content_1.Content.findOne({ _id: id, isDeleted: false });
    if (!content) {
        throw new errors_1.NotFoundError("Content not found");
    }
    // Check permissions
    if (req.user?.role === "teacher") {
        // Teachers can only edit their own content and only if it's pending
        if (content.uploaderId.toString() !== req.user._id.toString()) {
            throw new errors_1.AuthorizationError("You can only edit your own content");
        }
        if (content.approvalStatus === "approved") {
            throw new errors_1.AuthorizationError("Cannot edit approved content");
        }
    }
    // Notify admins if teacher uploaded content
    if (req.user?.role === "teacher") {
        await NotificationService_1.NotificationService.notifyContentSubmission(content._id, content.title);
    }
    Object.assign(content, req.body);
    await content.save();
    res.status(200).json({
        success: true,
        data: content,
    });
});
ContentController.deleteContent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const content = await Content_1.Content.findOne({ _id: id, isDeleted: false });
    if (!content) {
        throw new errors_1.NotFoundError("Content not found");
    }
    // Check permissions
    if (req.user?.role === "teacher") {
        // Teachers can only delete their own content and only if it's pending
        if (content.uploaderId.toString() !== req.user._id.toString()) {
            throw new errors_1.AuthorizationError("You can only delete your own content");
        }
        if (content.approvalStatus === "approved") {
            throw new errors_1.AuthorizationError("Can only delete pending and rejected content");
        }
    }
    content.isDeleted = true;
    content.deletedAt = new Date();
    content.deletedBy = req.user?._id || req.admin?._id;
    await content.save();
    res.status(200).json({
        success: true,
        message: "Content deleted successfully",
    });
});
// Bookmark
ContentController.getBookmark = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    let bookmarks = await Bookmark_1.Bookmark.findOne({ userId }).populate({
        path: "contents",
        match: { isDeleted: false },
    });
    if (!bookmarks) {
        bookmarks = new Bookmark_1.Bookmark({ userId, contents: [] });
        await bookmarks.save();
    }
    res.status(200).json({
        success: true,
        data: bookmarks,
    });
});
ContentController.addToBookmark = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { contentId } = req.body;
    const userId = req.user._id;
    // Ensure content exists
    const content = await Bookmark_1.Bookmark.findOne({
        _id: contentId,
        isActive: true,
        isDeleted: false,
    });
    if (!content) {
        throw new errors_1.NotFoundError("Content not found or inactive");
    }
    // Atomically create or update Bookmark
    const bookmarks = await Bookmark_1.Bookmark.findOneAndUpdate({ userId }, { $addToSet: { contents: contentId } }, { upsert: true, new: true }).populate("contents", "name type");
    return res.status(200).json({
        success: true,
        message: "Content added to Bookmark",
        data: bookmarks,
    });
});
ContentController.removeFromBookmark = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { contentId } = req.params;
    const userId = req.user._id;
    const bookmarks = await Bookmark_1.Bookmark.findOne({ userId });
    if (!bookmarks) {
        throw new errors_1.NotFoundError("Bookmark not found");
    }
    bookmarks.contents = bookmarks.contents.filter((id) => id.toString() !== contentId);
    await bookmarks.save();
    res.status(200).json({
        success: true,
        data: bookmarks,
    });
});
//# sourceMappingURL=ContentController.js.map