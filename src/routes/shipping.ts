import { Router } from "express";
import {
  getShipping,
  updateShipping,
} from "../controllers/ShippingController";
import { requireAdminAuth } from "../middleware/auth";

const router = Router();

/**
 * @route   POST /api/shipping/
 * @desc    Get shipping cost
 * @access  Public
 */
router.get(
  "/",
  getShipping
);

/**
 * @route   POST /api/shipping/
 * @desc    Update shipping cost
 * @access  Private (require admin auth) 
 */
router.patch(
  "/",
  requireAdminAuth,
  updateShipping
);

export default router;
