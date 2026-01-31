"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaginationResult = exports.getPaginationParams = void 0;
const getPaginationParams = (query) => {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
exports.getPaginationParams = getPaginationParams;
const createPaginationResult = (data, total, page, limit) => {
    const pages = Math.ceil(total / limit);
    const hasNext = page < pages;
    const hasPrev = page > 1;
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            pages,
            hasNext,
            hasPrev,
        },
    };
};
exports.createPaginationResult = createPaginationResult;
//# sourceMappingURL=pagination.js.map