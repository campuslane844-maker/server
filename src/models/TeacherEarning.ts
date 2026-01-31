// models/TeacherEarning.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ITeacherEarning extends Document {
  teacherId: mongoose.Types.ObjectId;
  month: string; // "2026-01"
  views: number;
  ratePerView: number;
  grossAmount: number;
  paid: boolean;
  razorpayPayoutId?: string;
}

const schema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    month: { type: String, index: true }, // YYYY-MM
    views: Number,
    ratePerView: Number,
    grossAmount: Number,
    paid: { type: Boolean, default: false },
    razorpayPayoutId: String
  },
  { timestamps: true }
);

schema.index({ teacherId: 1, month: 1 }, { unique: true });

export const TeacherEarning =
  mongoose.model<ITeacherEarning>("TeacherEarning", schema);
