import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
export declare class ProgressController {
    static openContent: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    static getMyProgress: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static completeContent: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static recordVideoTime: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getRecentlyVisited: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getContentProgress: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getChildProgress: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getStudentProgress: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static deleteProgress: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=ProgressController.d.ts.map