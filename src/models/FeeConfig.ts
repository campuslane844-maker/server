// models/FeeConfig.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IFeeConfig extends Document {
  amount: number;
  currency: string;
}

const feeConfigSchema = new Schema(
  {
    amount: { type: Number, required: true }, // e.g. 300
    currency: { type: String, default: "INR" },
  },
  { timestamps: true }
);

export const FeeConfig = mongoose.model("FeeConfig", feeConfigSchema);
