import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  type: { type: String, enum: ["image", "gif"], required: true },
  url: { type: String, required: true },
  fileId: { type: String, required: true }, // ImageKit fileId, needed for delete
  alt: { type: String, trim: true, default: "" },
});

const thumbnailSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    fileId: { type: String, required: true },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    about: { type: String, trim: true, default: "" },
    projectType: { type: String, trim: true, default: "" },
    role: { type: [String], default: [] },
    year: { type: Number },
    thumbnailImage: { type: thumbnailSchema, default: null }, // cover image, on ImageKit
    videoId: { type: String, default: null }, // YouTube ID only
    media: { type: [mediaSchema], default: [] }, // array order = display order
    endingStatement: { type: String, trim: true, default: "" },
    position: { type: Number, default: 0, index: true }, // project display order
  },
  { timestamps: true },
);

export const Project = mongoose.model("Project", projectSchema);
