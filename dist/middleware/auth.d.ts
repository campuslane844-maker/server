import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
export interface AuthenticatedRequest extends Request {
    user?: any;
    admin?: any;
}
export declare const requireAnyAuth: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => Promise<void>;
export declare const requireAuth: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => Promise<void>;
export declare const requireAdminAuth: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
export declare const requireRole: (roles: UserRole | UserRole[]) => (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
export declare const requireTeacherApproval: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map