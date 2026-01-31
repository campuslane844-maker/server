import mongoose, { Schema, Document } from "mongoose";

export interface IFeePayment extends Document {
  userId: mongoose.Types.ObjectId;

  studentInfo: {
    name: string;
    className: string;
    schoolName?: string;
    phone: string;
    address: {
      street?: string;
      city?: string;
      state?: string;
      pin?: string;
    };
  };

  month: number;
  year: number;

  amount: number;

  status: "Paid" | "Pending";
  paidAt?: Date;

  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

const feePaymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    studentInfo: {
      name: { type: String, required: true },
      className: { type: String, required: true },
      schoolName: String,
      phone: { type: String, required: true },

      address: {
        street: String,
        city: String,
        state: String,
        pin: String,
      },
    },

    month: { type: Number, required: true },
    year: { type: Number, required: true },

    amount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },

    paidAt: Date,

    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true }
);

export const FeePayment = mongoose.model<IFeePayment>(
  "FeePayment",
  feePaymentSchema
);
