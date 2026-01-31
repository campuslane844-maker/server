import { Router } from "express";
import { getMyReferralInfo } from "../controllers/ReferralController";
import { requireAnyAuth } from "../middleware/auth";
const router = Router();

router.get("/me", requireAnyAuth, getMyReferralInfo);
export default router;
