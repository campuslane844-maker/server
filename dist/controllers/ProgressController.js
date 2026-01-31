"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressController = void 0;
const ProgressService_1 = require("../services/ProgressService");
const ParentChildLink_1 = require("../models/ParentChildLink");
const Progress_1 = require("../models/Progress");
const asyncHandler_1 = require("../utils/asyncHandler");
const errors_1 = require("../utils/errors");
const Content_1 = require("../models/Content");
const ContentView_1 = require("../models/ContentView");
class ProgressController {
}
exports.ProgressController = ProgressController;
_a = ProgressController;
ProgressController.openContent = async (req, res) => {
    const { contentId } = req.body;
    const studentId = req.user._id;
    // existing progress logic
    const progress = await Progress_1.Progress.findOneAndUpdate({ studentId, contentId }, { $setOnInsert: { openedAt: new Date() }, status: "in_progress" }, { upsert: true, new: true });
    /**
     * Track unique view
     */
    try {
        await ContentView_1.ContentView.create({
            contentId,
            userId: studentId,
        });
        // increment cached counter ONLY if first view
        await Content_1.Content.findByIdAndUpdate(contentId, {
            $inc: { uniqueViews: 1 },
        });
    }
    catch (err) {
        // duplicate key error → already viewed → ignore
        if (err.code !== 11000)
            throw err;
    }
    res.json({ progress });
    return;
};
ProgressController.getMyProgress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const studentId = req.user?._id;
    if (!studentId)
        return res
            .status(401)
            .json({ success: false, message: "Unauthorized" });
    const { classId, subjectId } = req.query;
    const recentLimit = Math.max(0, Number(req.query.recentLimit ?? 10));
    const watchLimit = Math.max(0, Number(req.query.watchLimit ?? 50));
    const result = await ProgressService_1.ProgressService.getStudentProgress(studentId, recentLimit, watchLimit, classId, subjectId);
    return res.status(200).json({
        ...result,
    });
});
ProgressController.completeContent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { contentId, quizScore } = req.body;
    const studentId = req.user._id.toString();
    const progress = await ProgressService_1.ProgressService.completeContent(studentId, contentId, quizScore);
    res.status(200).json({
        success: true,
        data: progress,
    });
});
ProgressController.recordVideoTime = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { contentId, secondsSinceLastPing } = req.body;
    const studentId = req.user._id;
    if (!contentId || typeof secondsSinceLastPing !== "number") {
        return res
            .status(400)
            .json({ message: "Missing contentId or secondsSinceLastPing" });
    }
    const clampedSeconds = Math.min(Math.max(0, secondsSinceLastPing), 300);
    const now = new Date();
    let progress = await Progress_1.Progress.findOne({ studentId, contentId });
    if (!progress) {
        progress = new Progress_1.Progress({
            studentId,
            contentId,
            status: "in_progress",
            timeSpent: clampedSeconds,
            lastWatchedSecond: clampedSeconds,
            progressPercent: 0,
            watchSessions: [{ startedAt: now, duration: clampedSeconds }],
        });
    }
    else {
        progress.timeSpent += clampedSeconds;
        progress.lastWatchedSecond += clampedSeconds;
        // Append to watchSessions
        if (!progress.watchSessions)
            progress.watchSessions = [];
        progress.watchSessions.push({
            startedAt: now,
            duration: clampedSeconds,
        });
        // Calculate progressPercent based on content duration
        const content = await Content_1.Content.findById(contentId);
        if (content?.duration) {
            progress.progressPercent = Math.min((progress.timeSpent / content.duration) * 100, 100);
        }
        // Update status
        if (progress.progressPercent === 100) {
            progress.status = "completed";
            progress.completedAt = now;
        }
        else if (progress.progressPercent > 0 &&
            progress.status === "not_started") {
            progress.status = "in_progress";
        }
    }
    await progress.save();
    return res.status(200).json({
        success: true,
        data: progress,
    });
});
ProgressController.getRecentlyVisited = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const studentId = req.user._id;
    const limit = req.query.limit && !isNaN(Number(req.query.limit))
        ? Number(req.query.limit)
        : 10;
    const results = await Progress_1.Progress.find({ studentId })
        .sort({ updatedAt: -1 }) // most recently updated
        .limit(limit)
        .select("contentId contentSnapshot status progressPercent updatedAt")
        .populate("contentId", "title type thumbnailKey s3Key") // join with Content model
        .lean();
    res.status(200).json({
        success: true,
        data: results,
    });
});
ProgressController.getContentProgress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const studentId = req.user._id.toString();
    const progress = await Progress_1.Progress.find({
        contentId: id,
        studentId,
    });
    res.status(200).json({
        success: true,
        data: progress,
    });
});
ProgressController.getChildProgress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { studentId } = req.params;
    const parentId = req.user._id;
    // Verify parent-child link
    const link = await ParentChildLink_1.ParentChildLink.findOne({
        parentId,
        studentId,
        status: "approved",
    });
    if (!link) {
        throw new errors_1.AuthorizationError("You do not have permission to view this child's progress");
    }
    const recentLimit = Math.max(0, Number(req.query.recentLimit ?? 10));
    const watchLimit = Math.max(0, Number(req.query.watchLimit ?? 50));
    const result = await ProgressService_1.ProgressService.getStudentProgress(studentId, recentLimit, watchLimit);
    return res.status(200).json({
        ...result,
    });
});
ProgressController.getStudentProgress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { studentId } = req.params;
    const admin = req.admin;
    if (!admin) {
        return res.status(401).json({
            success: false,
        });
    }
    const recentLimit = Math.max(0, Number(req.query.recentLimit ?? 10));
    const watchLimit = Math.max(0, Number(req.query.watchLimit ?? 50));
    const result = await ProgressService_1.ProgressService.getStudentProgress(studentId, recentLimit, watchLimit);
    return res.status(200).json({
        ...result,
    });
});
ProgressController.deleteProgress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const progress = await Progress_1.Progress.findByIdAndDelete(id);
    if (!progress) {
        throw new errors_1.NotFoundError("Progress record not found");
    }
    res.status(200).json({
        success: true,
        message: "Progress record deleted successfully",
    });
});
//# sourceMappingURL=ProgressController.js.map