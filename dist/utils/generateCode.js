"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = exports.generateStudentCode = void 0;
const generateStudentCode = () => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `STU-${timestamp}-${randomPart}`.toUpperCase();
};
exports.generateStudentCode = generateStudentCode;
const generateId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
exports.generateId = generateId;
//# sourceMappingURL=generateCode.js.map