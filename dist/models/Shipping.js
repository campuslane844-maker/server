"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shipping = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const shippingSchema = new mongoose_1.default.Schema({
    cost: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });
exports.Shipping = mongoose_1.default.model('Shipping', shippingSchema);
//# sourceMappingURL=Shipping.js.map