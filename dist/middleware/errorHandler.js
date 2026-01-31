"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const errorHandler = (err, _req, res, _next) => {
    let error = { ...err };
    error.message = err.message;
    // Log error
    console.error(err);
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new errors_1.AppError(message, 404);
    }
    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new errors_1.AppError(message, 400);
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message).join(', ');
        error = new errors_1.AppError(message, 400);
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new errors_1.AppError(message, 401);
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new errors_1.AppError(message, 401);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: {
            message: error.message || 'Server Error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map