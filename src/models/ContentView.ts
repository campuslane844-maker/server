import mongoose, { Schema, Document } from "mongoose";

export interface IContentView extends Document {
  contentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  viewedAt: Date;
}

const contentViewSchema = new Schema<IContentView>(
  {
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },

  },
  { timestamps: false }
);

/**
 * 🔥 This ensures UNIQUE views
 * Same user cannot create multiple views for same content
 */
contentViewSchema.index(
  { contentId: 1, userId: 1 },
  { unique: true }
);

export const ContentView = mongoose.model<IContentView>(
  "ContentView",
  contentViewSchema
);
