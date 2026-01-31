import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
/**
 * -----------------------------
 * Create Razorpay Order
 * -----------------------------
 */
export declare const createFeeOrder: (req: AuthenticatedRequest, res: Response) => Promise<void>;
/**
 * -----------------------------
 * Verify Razorpay Payment
 * -----------------------------
 */
export declare const verifyFeePayment: (req: Request, res: Response) => Promise<void>;
/**
 * -----------------------------
 * Fee History (UI-ready)
 * -----------------------------
 */
export declare const getFeeHistory: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getFeeConfig: (_req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateFeeConfig: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=FeeController.d.ts.map