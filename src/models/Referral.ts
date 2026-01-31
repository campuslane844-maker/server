// models/Referral.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IReferral extends Document {
  referrer: mongoose.Types.ObjectId;
  referee: mongoose.Types.ObjectId;
  rewardGranted: boolean;
  createdAt: Date;
}

const referralSchema = new Schema<IReferral>(
  {
    referrer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    referee: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rewardGranted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

referralSchema.index({ referee: 1 }, { unique: true });

export const Referral = mongoose.model<IReferral>("Referral", referralSchema);
