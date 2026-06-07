const mongoose = require("mongoose");

const periodSchema = new mongoose.Schema({
  periodNumber: { type: Number, required: true },
  startTime:    { type: String, required: true }, // e.g. "09:00"
  endTime:      { type: String, required: true }, // e.g. "09:45"
  subject:      { type: String, required: true },
  teacher:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  teacherName:  { type: String },
});

const timetableSchema = new mongoose.Schema({
  class:     { type: String, required: true },  // e.g. "10A"
  day:       { type: String, required: true, enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] },
  periods:   [periodSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  session:   { type: String, default: "2025-2026" },
}, { timestamps: true });

module.exports = mongoose.model("Timetable", timetableSchema);