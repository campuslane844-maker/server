"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShipping = exports.getShipping = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const Shipping_1 = require("../models/Shipping");
/** ---------- Get Shipping Cost ---------- */
// @desc    Get flat shipping cost
// @route   GET /api/shipping
// @access  Public
exports.getShipping = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    try {
        let shipping = await Shipping_1.Shipping.findOne();
        if (!shipping) {
            shipping = new Shipping_1.Shipping({ cost: 0 });
            await shipping.save();
        }
        return res.status(200).json({
            success: true,
            cost: shipping.cost,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});
/** ---------- Update Shipping Cost ---------- */
// @desc    Update flat shipping cost
// @route   PUT /api/shipping
// @access  Private/Admin
exports.updateShipping = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { cost } = req.body;
        if (cost === undefined) {
            return res
                .status(400)
                .json({ success: false, message: "Cost is required" });
        }
        let shipping = await Shipping_1.Shipping.findOne();
        if (!shipping) {
            shipping = new Shipping_1.Shipping({ cost });
        }
        else {
            shipping.cost = cost;
        }
        await shipping.save();
        return res.status(200).json({
            success: true,
            cost: shipping.cost,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});
/** ---------- Exports ---------- */
exports.default = {
    getShipping: exports.getShipping,
    updateShipping: exports.updateShipping,
};
//# sourceMappingURL=ShippingController.js.map