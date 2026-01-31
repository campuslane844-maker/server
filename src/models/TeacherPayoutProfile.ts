// models/TeacherPayoutProfile.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ITeacherPayoutProfile extends Document {
  teacherId: mongoose.Types.ObjectId;
  contactId: string;       // Razorpay contact_id
  fundAccountId: string;  // Razorpay fund_account_id
  method: "bank" | "upi";
  active: boolean;
}

const schema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "User", unique: true },
    contactId: String,
    fundAccountId: String,
    method: { type: String, enum: ["bank", "upi"] },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const TeacherPayoutProfile =
  mongoose.model<ITeacherPayoutProfile>("TeacherPayoutProfile", schema);
