import mongoose, { Schema, Document } from "mongoose";

export type SubscriptionStatus =
  | "created"
  | "active"
  | "authenticated"
  | "paused"
  | "cancelled"
  | "expired";

export interface IStudentSubscription extends Document {
  studentId: mongoose.Types.ObjectId;

  plan: "monthly" | "yearly";
  status: SubscriptionStatus;

  currentStart?: Date;
  currentEnd?: Date;

  razorpaySubscriptionId: string;
  razorpayPlanId: string;

  cancelAtCycleEnd: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const studentSubscriptionSchema = new Schema<IStudentSubscription>(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    plan: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "created",
        "authenticated",
        "active",
        "paused",
        "cancelled",
        "expired",
      ],
      default: "created",
    },

    currentStart: Date,
    currentEnd: Date,

    razorpaySubscriptionId: {
      type: String,
      required: true,
      unique: true,
    },

    razorpayPlanId: {
      type: String,
      required: true,
    },

    cancelAtCycleEnd: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const StudentSubscription = mongoose.model(
  "StudentSubscription",
  studentSubscriptionSchema
);
