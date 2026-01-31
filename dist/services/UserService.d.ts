import { IUser } from "../models/User";
import { UserRole } from "../types";
import { Types } from "mongoose";
export declare class UserService {
    static findOrCreateFromGoogle(name: string, token: string, phone?: string, city?: string, state?: string, country?: string, pincode?: string, role?: UserRole, age?: number, classLevel?: Types.ObjectId, classOther?: string, upiId?: string, referralCode?: string): Promise<IUser>;
    static findById(userId: string): Promise<IUser | null>;
    static updateProfile(userId: string, updates: Partial<IUser>): Promise<IUser | null>;
}
//# sourceMappingURL=UserService.d.ts.map