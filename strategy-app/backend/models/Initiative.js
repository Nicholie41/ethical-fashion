const mongoose = require("mongoose");

const kpiSnapshotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    baseline: { type: Number, required: true },
    target: { type: Number, required: true },
    current: { type: Number, required: true }
  },
  { _id: false }
);

const milestoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["planned", "in-progress", "completed", "blocked"],
      default: "planned"
    }
  },
  { _id: false }
);

const initiativeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: String, required: true, trim: true },
    workstream: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["planned", "in-progress", "completed", "on-hold"],
      default: "planned"
    },
    investment: { type: Number, required: true },
    expectedROI: { type: Number, required: true },
    kpis: [kpiSnapshotSchema],
    milestones: [milestoneSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Initiative", initiativeSchema);
