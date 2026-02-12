"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const UserService_1 = require("../services/UserService");
const Admin_1 = require("../models/Admin");
const jwt_1 = require("../utils/jwt");
const asyncHandler_1 = require("../utils/asyncHandler");
const errors_1 = require("../utils/errors");
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.googleSignIn = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { idToken, role, name, phone, city, state, country, pincode, age, classLevel, classOther, upiId } = req.body;
    const referralCode = req.query.ref;
    console.log(req.body);
    const user = (await UserService_1.UserService.findOrCreateFromGoogle(name, idToken, phone, city, state, country, pincode, role, age, classLevel, classOther, upiId, referralCode));
    const token = (0, jwt_1.generateToken)({
        userId: user._id.toString(),
        role: user.role,
    });
    res.status(200).json({
        success: true,
        data: {
            token,
            user,
        },
    });
});
AuthController.adminLogin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin_1.Admin.findOne({ email }).select("+password");
    if (!admin || !(await admin.comparePassword(password))) {
        throw new errors_1.AuthenticationError("Invalid email or password");
    }
    const token = (0, jwt_1.generateAdminToken)({
        adminId: admin._id.toString(),
    });
    res.status(200).json({
        success: true,
        data: {
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
            },
        },
    });
});
AuthController.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // @ts-ignore – injected by auth middleware
    const userId = req.user?.userId;
    if (!userId) {
        throw new errors_1.AuthenticationError("Unauthorized");
    }
    const user = await UserService_1.UserService.findById(userId);
    if (!user || user.isDeleted) {
        throw new errors_1.AuthenticationError("User not found");
    }
    res.status(200).json({
        success: true,
        data: {
            user,
        },
    });
});
//# sourceMappingURL=AuthController.js.map