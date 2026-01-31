import { PaginationQuery, PaginationResult } from '../types';
export declare const getPaginationParams: (query: PaginationQuery) => {
    page: number;
    limit: number;
    skip: number;
};
export declare const createPaginationResult: <T>(data: T[], total: number, page: number, limit: number) => PaginationResult<T>;
//# sourceMappingURL=pagination.d.ts.map