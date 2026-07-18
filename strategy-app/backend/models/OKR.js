const mongoose = require("mongoose");

const keyResultSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    metricType: {
      type: String,
      enum: ["number", "percent", "currency"],
      default: "percent"
    },
    startValue: { type: Number, default: 0 },
    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    owner: { type: String, trim: true, default: "" }
  },
  { _id: true }
);

const okrSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    period: { type: String, required: true, trim: true },
    owner: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["draft", "active", "completed", "cancelled"],
      default: "active"
    },
    keyResults: [keyResultSchema],
    linkedInitiativeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Initiative" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

okrSchema.index({ orgId: 1, period: 1 });

module.exports = mongoose.model("OKR", okrSchema);
