"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const errorHandler_1 = require("./middleware/errorHandler");
const routes_1 = __importDefault(require("./routes"));
const razorpayWebhook_1 = __importDefault(require("./routes/razorpayWebhook"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
const allowedOrigins = [
    "https://campus-lane.com",
    "https://www.campus-lane.com",
    "https://dashboard.campus-lane.com",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3000"
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true); // allow mobile apps / curl
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        else {
            return callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// For preflight requests
app.options("*", (0, cors_1.default)());
app.use('/api/v1/webhooks', razorpayWebhook_1.default);
// General middleware
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_mongo_sanitize_1.default)());
// Logging
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
// API routes
app.use('/api/v1', routes_1.default);
// 404 handler
app.all('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: `Route ${req.originalUrl} not found`,
        },
    });
});
// Global error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map