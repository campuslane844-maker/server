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
exports.Product = exports.Variant = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const variantSchema = new mongoose_1.Schema({
    product: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    cutoffPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String }],
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc, ret) {
            delete ret.__v;
            return ret;
        },
    },
});
variantSchema.index({ product: 1 });
variantSchema.index({ name: 1, product: 1 });
exports.Variant = mongoose_1.default.model('Variant', variantSchema);
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }],
    school: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'School' },
    gender: { type: String, enum: ['Boys', 'Girls', 'Unisex'] },
    classLevel: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Class' },
    subject: { type: String },
    brand: { type: String },
    type: { type: String },
    isActive: { type: Boolean, default: true },
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
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ school: 1, isActive: 1 });
productSchema.index({ isActive: 1, isDeleted: 1 });
productSchema.index({ description: 'text' });
exports.Product = mongoose_1.default.model('Product', productSchema);
//# sourceMappingURL=Product.js.map