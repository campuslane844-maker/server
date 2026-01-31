"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validateBody = void 0;
const errors_1 = require("../utils/errors");
const validateBody = (schema) => {
    return (req, _res, next) => {
        try {
            const validated = schema.parse(req.body);
            req.body = validated;
            next();
        }
        catch (error) {
            const message = error.errors?.map((err) => err.message).join(', ') || 'Validation failed';
            next(new errors_1.ValidationError(message));
        }
    };
};
exports.validateBody = validateBody;
const validateQuery = (schema) => {
    return (req, _res, next) => {
        try {
            const validated = schema.parse(req.query);
            req.query = validated;
            next();
        }
        catch (error) {
            const message = error.errors?.map((err) => err.message).join(', ') || 'Validation failed';
            next(new errors_1.ValidationError(message));
        }
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, _res, next) => {
        try {
            const validated = schema.parse(req.params);
            req.params = validated;
            next();
        }
        catch (error) {
            const message = error.errors?.map((err) => err.message).join(', ') || 'Validation failed';
            next(new errors_1.ValidationError(message));
        }
    };
};
exports.validateParams = validateParams;
//# sourceMappingURL=validation.js.map