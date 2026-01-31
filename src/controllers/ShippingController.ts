import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Shipping } from "../models/Shipping";

/** ---------- Types ---------- */
interface AuthenticatedRequest extends Request {
  user?: { _id: string; role?: string };
}


/** ---------- Get Shipping Cost ---------- */
// @desc    Get flat shipping cost
// @route   GET /api/shipping
// @access  Public
export const getShipping = asyncHandler(
  async (_req: Request, res: Response): Promise<Response> => {
    try {
      let shipping = await Shipping.findOne();
      if (!shipping) {
        shipping = new Shipping({ cost: 0 });
        await shipping.save();
      }

      return res.status(200).json({
        success: true,
        cost: shipping.cost,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

/** ---------- Update Shipping Cost ---------- */
// @desc    Update flat shipping cost
// @route   PUT /api/shipping
// @access  Private/Admin
export const updateShipping = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { cost } = req.body;
      if (cost === undefined) {
        return res
          .status(400)
          .json({ success: false, message: "Cost is required" });
      }

      let shipping = await Shipping.findOne();
      if (!shipping) {
        shipping = new Shipping({ cost });
      } else {
        shipping.cost = cost;
      }

      await shipping.save();

      return res.status(200).json({
        success: true,
        cost: shipping.cost,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

/** ---------- Exports ---------- */
export default {
  getShipping,
  updateShipping,
};
