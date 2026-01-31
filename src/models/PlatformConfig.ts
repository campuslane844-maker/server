import mongoose, { Schema, Document } from "mongoose";

export interface IPlatformConfig extends Document {
  payPerView: number; // rate per unique view
}

const schema = new Schema(
  {
    payPerView: {
      type: Number,
      required: true,
      min: 0,
      default: 0.1,
    },
  },
  { timestamps: true }
);

export const PlatformConfig = mongoose.model<IPlatformConfig>(
  "PlatformConfig",
  schema
);
