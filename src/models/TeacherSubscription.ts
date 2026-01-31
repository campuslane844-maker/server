import mongoose, { Schema, Document } from "mongoose";

export interface ITeacherSubscription extends Document {
  teacherId: mongoose.Types.ObjectId;

  planId: mongoose.Types.ObjectId;
  planCode: string;

  status: "active" | "expired";

  uploadsUsed: number;
  uploadLimit: number | null;

  startDate: Date;
  endDate: Date;

  isFree?: Boolean;

  razorpayPaymentId?: string;
  createdAt: Date;
}

const teacherSubscriptionSchema = new Schema<ITeacherSubscription>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "User", index: true },

    planId: { type: Schema.Types.ObjectId, ref: "TeacherPlan" },
    planCode: String,

    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },

    uploadsUsed: { type: Number, default: 0 },
    uploadLimit: { type: Number, default: null },

    startDate: Date,
    endDate: Date,

    razorpayPaymentId: String,

    isFree: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const TeacherSubscription = mongoose.model(
  "TeacherSubscription",
  teacherSubscriptionSchema
);
