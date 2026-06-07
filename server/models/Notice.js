const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  targetType:{ type: String, enum: ["all", "class"], required: true },
  targetClass:{ type: String, default: "" }, // only if targetType === "class"
  priority:  { type: String, enum: ["normal", "important", "urgent"], default: "normal" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdByName: { type: String },
  createdByRole: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Notice", noticeSchema);