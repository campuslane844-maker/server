"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTeacherApproval = exports.requireRole = exports.optionalAuth = exports.requireAdminAuth = exports.requireAuth = exports.requireAnyAuth = void 0;
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
const User_1 = require("../models/User");
const Admin_1 = require("../models/Admin");
const requireAnyAuth = async (req, _res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token)
            throw new errors_1.AuthenticationError('No token provided');
        // Try user token first
        try {
            const decodedUser = (0, jwt_1.verifyToken)(token);
            const user = await User_1.User.findById(decodedUser.userId).select('-__v');
            if (user) {
                req.user = user;
                return next();
            }
        }
        catch (_) {
            // ignore and try admin
        }
        // Try admin token
        try {
            const decodedAdmin = (0, jwt_1.verifyAdminToken)(token);
            const admin = await Admin_1.Admin.findById(decodedAdmin.adminId).select('-password -__v');
            if (admin) {
                req.admin = admin;
                return next();
            }
        }
        catch (_) {
            // ignore
        }
        throw new errors_1.AuthenticationError('Invalid token');
    }
    catch (error) {
        next(error);
    }
};
exports.requireAnyAuth = requireAnyAuth;
const requireAuth = async (req, _res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new errors_1.AuthenticationError('Sign in with your account to continue');
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await User_1.User.findById(decoded.userId).select('-__v');
        if (!user) {
            throw new errors_1.AuthenticationError('User not found');
        }
        req.user = user;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireAuth = requireAuth;
const requireAdminAuth = async (req, _res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new errors_1.AuthenticationError('No token provided');
        }
        const decoded = (0, jwt_1.verifyAdminToken)(token);
        const admin = await Admin_1.Admin.findById(decoded.adminId).select('-password -__v');
        if (!admin) {
            throw new errors_1.AuthenticationError('Admin not found');
        }
        req.admin = admin;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireAdminAuth = requireAdminAuth;
const optionalAuth = (req, _res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return next(); // no user → continue as guest
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded; // attach user
    }
    catch (err) {
        // invalid token → ignore and continue as guest
    }
    next();
};
exports.optionalAuth = optionalAuth;
const requireRole = (roles) => {
    return (req, _res, next) => {
        const userRoles = Array.isArray(roles) ? roles : [roles];
        if (!req.user || !userRoles.includes(req.user.role)) {
            return next(new errors_1.AuthorizationError('Insufficient permissions'));
        }
        next();
    };
};
exports.requireRole = requireRole;
const requireTeacherApproval = (req, _res, next) => {
    if (req.user?.role === 'teacher' && req.user.approvalStatus !== 'approved') {
        return next(new errors_1.AuthorizationError('Teacher approval required'));
    }
    next();
};
exports.requireTeacherApproval = requireTeacherApproval;
//# sourceMappingURL=auth.js.map