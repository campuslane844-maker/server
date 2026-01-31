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
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: String, required: true },
    role: {
        type: String,
        enum: ["student", "teacher", "parent"],
        required: true,
    },
    googleId: { type: String, unique: true, sparse: true },
    // Student-specific fields
    age: {
        type: Number,
        required: function () {
            return this.role === "student";
        },
    },
    classLevel: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Class",
    },
    classOther: {
        type: String,
    },
    studentCode: {
        type: String,
        unique: true,
        immutable: true,
        sparse: true,
    },
    // Teacher-specific fields
    approvalStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: function () {
            return this.role === "teacher" ? "pending" : undefined;
        },
    },
    upiId: {
        type: String,
        required: function () {
            return this.role === "teacher";
        },
    },
    referralCode: {
        type: String,
        unique: true,
        sparse: true,
    },
    referredBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
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
// --- Generate 6-char uppercase alphanumeric studentCode automatically ---
function generateStudentCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
userSchema.pre("validate", async function (next) {
    if (this.role === "student" && !this.studentCode) {
        let code;
        let exists = true;
        // Ensure uniqueness
        do {
            code = generateStudentCode();
            const existing = await mongoose_1.default.models.User.findOne({
                studentCode: code,
            });
            if (!existing)
                exists = false;
        } while (exists);
        this.studentCode = code;
    }
    next();
});
function generateReferralCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
userSchema.pre("validate", async function (next) {
    if (this.role === "teacher" && !this.referralCode) {
        let exists = true;
        let code = "";
        while (exists) {
            code = generateReferralCode();
            const found = await mongoose_1.default.models.User.findOne({ referralCode: code });
            if (!found)
                exists = false;
        }
        this.referralCode = code;
    }
    next();
});
// Indexes
userSchema.index({ role: 1, approvalStatus: 1 });
userSchema.index({ isDeleted: 1 });
exports.User = mongoose_1.default.model("User", userSchema);
//# sourceMappingURL=User.js.map