import { Response } from "express";
export declare class EcommerceController {
    static getSchools: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static createSchool: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateSchool: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static deleteSchool: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getCategories: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static createCategory: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateCategory: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static deleteCategory: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getProducts: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getProductById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static createProduct: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateProduct: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static deleteProduct: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getCart: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static addToCart: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateCartItem: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static removeCartItem: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static clearCart: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getLocalCart: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static mergeCart: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static checkout: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static reorder: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getOrders: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getMyOrders: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getOrderById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static cancelOrder: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateOrderStatus: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getWishlist: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static addToWishlist: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static removeFromWishlist: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getReviews: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static createReview: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateReview: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static deleteReview: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=EcommerceController.d.ts.map