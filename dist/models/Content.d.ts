import mongoose, { Document } from 'mongoose';
import { ContentType, ApprovalStatus, QuizType, UserRole } from '../types';
export interface IQuestion {
    questionText: string;
    s3Key?: string;
    options: string[];
    correctOption: number;
}
export interface IContent extends Document {
    title: string;
    description?: string;
    paid?: boolean;
    classId: mongoose.Types.ObjectId;
    subjectId: mongoose.Types.ObjectId;
    chapterId: mongoose.Types.ObjectId;
    type: ContentType;
    duration?: number;
    fileSize?: number;
    s3Key?: string;
    thumbnailKey?: string;
    quizType?: QuizType;
    googleFormUrl?: string;
    questions?: IQuestion[];
    uploaderId: mongoose.Types.ObjectId;
    uploaderRole: UserRole;
    isAdminContent: boolean;
    approvalStatus: ApprovalStatus;
    feedback: string;
    tags: string[];
    uniqueViews: number;
    isDeleted?: boolean;
    deletedAt?: Date;
    deletedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    __v?: number;
}
export declare const Content: mongoose.Model<IContent, {}, {}, {}, mongoose.Document<unknown, {}, IContent, {}, {}> & IContent & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
//# sourceMappingURL=Content.d.ts.map