import { Router } from "express";
import bodyParser from "body-parser";
import { razorpayWebhookHandler } from "../controllers/RazorpayWebhookController";

const router = Router();

/**
 * Razorpay requires RAW body
 */
router.post(
  "/razorpay",
  bodyParser.raw({ type: "application/json" }),
  razorpayWebhookHandler
);

export default router;
