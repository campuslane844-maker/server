"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables first
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const PORT = process.env.PORT || 3001;
const startServer = async () => {
    try {
        // Connect to database
        await (0, database_1.connectDatabase)();
        // Start server
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Campus Lane API server running on port ${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/api/v1/health`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('👋 SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
//# sourceMappingURL=server.js.map