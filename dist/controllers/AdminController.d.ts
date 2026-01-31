import { Response } from "express";
export declare class AdminController {
    static getTeachers: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getTeacherById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateTeacher: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static deleteTeacher: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static approveTeacher: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static rejectTeacher: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getContentForApproval: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static approveContent: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static rejectContent: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getStudents: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getStudentById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateStudent: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static deleteStudent: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getParents: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static getParentById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static updateParent: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static deleteParent: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    static generatePresignedUrl: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const updatePayPerView: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=AdminController.d.ts.map