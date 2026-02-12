"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const User_1 = require("../models/User");
const NotificationService_1 = require("./NotificationService");
const Referral_1 = require("../models/Referral");
const axios_1 = __importDefault(require("axios"));
const google_auth_library_1 = require("google-auth-library");
/**
 * IMPORTANT:
 * Use WEB CLIENT ID (not Android / iOS)
 */
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
/**
 * Resolves Google user info from either:
 * - ID TOKEN (JWT)
 * - ACCESS TOKEN
 */
async function getGoogleUserFromToken(token) {
    // Try ID token verification
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email || !payload.sub) {
            throw new Error("Invalid ID token payload");
        }
        return {
            email: payload.email,
            sub: payload.sub,
            name: payload.name,
            picture: payload.picture,
        };
    }
    catch (err) {
        // Ignore and fallback to access token
    }
    // Fallback: Access token via UserInfo API
    try {
        const { data } = await axios_1.default.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!data?.email || !data?.sub) {
            throw new Error("Invalid access token response");
        }
        return {
            email: data.email,
            sub: data.sub,
            name: data.name,
            picture: data.picture,
        };
    }
    catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to get Google user");
    }
}
class UserService {
    static async findOrCreateFromGoogle(name, token, phone, city, state, country, pincode, role, age, classLevel, classOther, upiId, referralCode) {
        const googleUser = await getGoogleUserFromToken(token);
        let user = await User_1.User.findOne({
            $or: [{ email: googleUser.email }, { googleId: googleUser.sub }],
        });
        if (user) {
            if (!user.googleId) {
                user.googleId = googleUser.sub;
                await user.save();
            }
            return user;
        }
        let referrerUser = null;
        if (referralCode) {
            referrerUser = await User_1.User.findOne({
                referralCode,
                role: "teacher",
                isDeleted: false,
            });
        }
        const userData = {
            name: name || googleUser.name || "",
            email: googleUser.email,
            googleId: googleUser.sub,
            phone,
            pincode,
            city,
            state,
            country,
            role: role || "student",
            upiId,
            referredBy: referrerUser?._id,
        };
        if (userData.role === "student") {
            if (age) {
                userData.age = age;
            }
            if (classLevel) {
                userData.classLevel = classLevel;
            }
            if (classOther) {
                userData.classOther = classOther;
            }
        }
        if (userData.role === 'parent') {
            userData.pincode = userData.pincode;
        }
        user = new User_1.User(userData);
        await user.save();
        if (referrerUser &&
            userData.role === "teacher" &&
            !referrerUser._id.equals(user._id)) {
            await Referral_1.Referral.create({
                referrer: referrerUser._id,
                referee: user._id,
            });
        }
        if (userData.role === "teacher") {
            await NotificationService_1.NotificationService.notifyTeacherSignup(user._id, user.name);
        }
        return user;
    }
    static async findById(userId) {
        return User_1.User.findById(userId);
    }
    static async updateProfile(userId, updates) {
        const allowedUpdates = { ...updates };
        delete allowedUpdates.email;
        delete allowedUpdates.googleId;
        delete allowedUpdates.role;
        delete allowedUpdates.studentCode;
        delete allowedUpdates.approvalStatus;
        return User_1.User.findByIdAndUpdate(userId, allowedUpdates, { new: true });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map