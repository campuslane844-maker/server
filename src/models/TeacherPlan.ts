import mongoose, { Schema, Document } from "mongoose";

export interface ITeacherPlan extends Document {
  code: string;                 // free | starter | pro
  name: string;
  price: number;                // in INR
  durationDays: number;         // 30, 365
  uploadLimit: number | null;   // null = unlimited
  isFree: boolean;
  isActive: boolean;
  createdAt: Date;
}

const teacherPlanSchema = new Schema<ITeacherPlan>(
  {
    code: { type: String, unique: true },
    name: String,
    price: Number,
    durationDays: Number,
    uploadLimit: { type: Number, default: null },
    isFree: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const TeacherPlan = mongoose.model(
  "TeacherPlan",
  teacherPlanSchema
);
