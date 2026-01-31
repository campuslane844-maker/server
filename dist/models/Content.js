"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Content = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Question sub-schema
const questionSchema = new mongoose_1.Schema({
    questionText: { type: String, required: true },
    s3Key: { type: String },
    options: {
        type: [String],
        validate: {
            validator: function (val) {
                return val.length === 4;
            },
            message: 'Each question must have exactly 4 options.',
        },
        required: true,
    },
    correctOption: {
        type: Number,
        min: 0,
        max: 3,
        required: true,
    },
}, { _id: false });
const contentSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    paid: { type: Boolean },
    classId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Class', required: true },
    subjectId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Subject', required: true },
    chapterId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Chapter', required: true },
    type: {
        type: String,
        enum: ['file', 'video', 'quiz', 'game', 'image'],
        required: true
    },
    s3Key: { type: String },
    duration: {
        type: Number,
        min: 0,
        required: function () { return this.type === 'video'; }
    },
    fileSize: { type: Number, min: 0 },
    thumbnailKey: { type: String },
    quizType: {
        type: String,
        enum: ['googleForm', 'native'],
        required: function () { return this.type === 'quiz'; }
    },
    googleFormUrl: { type: String },
    questions: {
        type: [questionSchema],
        required: function () {
            return this.type === 'quiz' && this.quizType === 'native';
        },
    },
    uploaderId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    uploaderRole: {
        type: String,
        enum: ['teacher', 'admin'],
        required: true
    },
    isAdminContent: { type: Boolean, default: false },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        required: true,
        default: 'pending'
    },
    feedback: String,
    tags: [{ type: String }],
    uniqueViews: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc, ret) {
            delete ret.__v;
            delete ret.isDeleted;
            delete ret.deletedAt;
            delete ret.deletedBy;
            return ret;
        },
    },
});
// Auto-approve admin content
contentSchema.pre('save', function (next) {
    if (this.isNew && this.uploaderRole === 'admin') {
        this.approvalStatus = 'approved';
        this.isAdminContent = true;
    }
    if (this.type === "video") {
        this.duration = Math.floor(this.duration);
    }
    next();
});
// Indexes
contentSchema.index({ classId: 1, subjectId: 1, chapterId: 1 });
contentSchema.index({ approvalStatus: 1, uploaderRole: 1 });
contentSchema.index({ uploaderId: 1 });
contentSchema.index({ type: 1 });
contentSchema.index({ isDeleted: 1 });
contentSchema.index({ title: 'text', description: 'text', tags: 'text' });
exports.Content = mongoose_1.default.model('Content', contentSchema);
//# sourceMappingURL=Content.js.map