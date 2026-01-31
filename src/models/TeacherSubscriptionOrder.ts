import mongoose, { Schema, Document } from "mongoose";

export interface ITeacherSubscriptionOrder extends Document {
  teacherId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;

  razorpayOrderId: string;
  amount: number;

  status: "created" | "paid";
  createdAt: Date;
}

const teacherSubscriptionOrderSchema = new Schema<ITeacherSubscriptionOrder>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    planId: { type: Schema.Types.ObjectId, ref: "TeacherPlan" },

    razorpayOrderId: { type: String, unique: true },
    amount: Number,

    status: {
      type: String,
      enum: ["created", "paid"],
      default: "created",
    },
  },
  { timestamps: true }
);

export const TeacherSubscriptionOrder = mongoose.model(
  "TeacherSubscriptionOrder",
  teacherSubscriptionOrderSchema
);
