import { JwtPayload, AdminJwtPayload } from '../types';
export declare const generateToken: (payload: JwtPayload) => string;
export declare const generateAdminToken: (payload: AdminJwtPayload) => string;
export declare const verifyToken: (token: string) => JwtPayload;
export declare const verifyAdminToken: (token: string) => AdminJwtPayload;
//# sourceMappingURL=jwt.d.ts.map