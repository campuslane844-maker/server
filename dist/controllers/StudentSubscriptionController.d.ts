import { Request, Response } from "express";
/**
 * POST /api/student-subscription/create
 * Create Razorpay subscription
 */
export declare function createStudentSubscription(req: Request, res: Response): Promise<void>;
/**
 * GET /api/student-subscription/me
 * Get logged-in student's subscription status
 */
export declare function getMySubscription(req: Request, res: Response): Promise<void>;
/**
 * POST /api/student-subscription/cancel
 * Cancel subscription at cycle end
 */
export declare function cancelMySubscription(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=StudentSubscriptionController.d.ts.map