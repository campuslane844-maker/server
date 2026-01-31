import mongoose, { Document } from "mongoose";
export interface IProgress extends Document {
    studentId: mongoose.Types.ObjectId;
    contentId: mongoose.Types.ObjectId;
    status: "not_started" | "in_progress" | "completed";
    timeSpent: number;
    lastWatchedSecond: number;
    progressPercent: number;
    watchSessions?: {
        startedAt: Date;
        duration: number;
    }[];
    quizScore?: number;
    completedAt?: Date;
    contentSnapshot?: {
        title?: string;
        type?: string;
        duration?: number;
        s3key?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const Progress: mongoose.Model<IProgress, {}, {}, {}, mongoose.Document<unknown, {}, IProgress, {}, {}> & IProgress & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Progress.d.ts.map