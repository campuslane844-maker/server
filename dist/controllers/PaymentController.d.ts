import { Request, Response } from "express";
/** ---------- Validation Rules ---------- */
export declare const createOrderValidation: import("express-validator").ValidationChain[];
export declare const verifyPaymentValidation: import("express-validator").ValidationChain[];
/** ---------- Create Razorpay Payment Order ---------- */
export declare const createPaymentOrder: (req: Request, res: Response, next: import("express").NextFunction) => void;
/** ---------- Verify Razorpay Payment ---------- */
export declare const verifyPayment: (req: Request, res: Response, next: import("express").NextFunction) => void;
/** ---------- Exports ---------- */
declare const _default: {
    createPaymentOrder: (((req: Request, res: Response, next: import("express").NextFunction) => void) | import("express-validator").ValidationChain[])[];
    verifyPayment: (((req: Request, res: Response, next: import("express").NextFunction) => void) | import("express-validator").ValidationChain[])[];
};
export default _default;
//# sourceMappingURL=PaymentController.d.ts.map