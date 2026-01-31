import { Router } from "express";
import { requireAnyAuth } from "../middleware/auth";
import { getPlatformOverview } from "../controllers/PlatformController";
const router = Router();

router.get(
  "/analytics/overview",
  requireAnyAuth,
  getPlatformOverview
);

export default router;
