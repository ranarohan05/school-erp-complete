const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: "" },
  type:        { type: String, enum: ["academic","sports","cultural","other"], default: "academic" },
  badge:       { type: String, enum: ["🥇","🥈","🥉","🏆","⭐","🎖️","🎓","💡"], default: "🏆" },
  awardedTo:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  awardedToName: { type: String },
  awardedToRole: { type: String, enum: ["student","teacher"], default: "student" },
  awardedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  awardedByName: { type: String },
  date:        { type: Date, default: Date.now },
  session:     { type: String, default: "2025-2026" },
}, { timestamps: true });

module.exports = mongoose.model("Achievement", achievementSchema);