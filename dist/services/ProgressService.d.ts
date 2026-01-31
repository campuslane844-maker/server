import { IProgress } from '../models/Progress';
import mongoose from 'mongoose';
export declare class ProgressService {
    static openContent(studentId: mongoose.Types.ObjectId, contentId: string): Promise<IProgress>;
    static completeContent(studentId: string, contentId: string, quizScore?: number): Promise<IProgress>;
    static recordVideoTime(studentId: string, contentId: string, secondsSinceLastPing: number): Promise<IProgress>;
    static getStudentProgress(studentId: string, recentLimit: number, watchLimit: number, classId?: mongoose.Types.ObjectId, subjectId?: mongoose.Types.ObjectId): Promise<{
        success: boolean;
        overall: {
            totalContents: any;
            completed: any;
            inProgress: any;
            notStarted: any;
            percentage: number;
        };
        byType: any;
        weekly: any;
        monthly: any;
        classes: any;
        recent: any;
        watchHistory: any;
    }>;
}
//# sourceMappingURL=ProgressService.d.ts.map