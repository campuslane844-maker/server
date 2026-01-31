import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
export declare function getTeacherPlans(_req: Request, res: Response): Promise<void>;
export declare function getMyTeacherSubscription(req: Request, res: Response): Promise<void>;
export declare function upgradeTeacherSubscription(req: Request, res: Response): Promise<void>;
export declare function confirmTeacherSubscription(req: Request, res: Response): Promise<void>;
export declare function assertTeacherCanUpload(teacherId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/TeacherSubscription").ITeacherSubscription, {}, import("mongoose").DefaultSchemaOptions> & import("../models/TeacherSubscription").ITeacherSubscription & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function updateTeacherPlan(req: AuthenticatedRequest, res: Response): Promise<void>;
//# sourceMappingURL=TeacherSubscriptionController.d.ts.map