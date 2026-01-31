import { Router } from "express";
import {
  createFeeOrder,
  verifyFeePayment,
  getFeeHistory,
  getFeeConfig,
  updateFeeConfig
} from "../controllers/FeeController";
import { requireAdminAuth, requireAuth } from "../middleware/auth";

const router = Router();

/**
 * School Fee Routes
 * Base path: /api/fees
 */

router.post("/create-order", requireAuth, createFeeOrder);
router.post("/verify", requireAuth, verifyFeePayment);
router.get("/history", requireAuth, getFeeHistory);
router.get("/config", getFeeConfig);

router.patch(
  "/config",
  requireAdminAuth,
  updateFeeConfig
);


export default router;
