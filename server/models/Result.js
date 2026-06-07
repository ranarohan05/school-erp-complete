const mongoose = require("mongoose");

const subjectMarkSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  marksObtained: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  grade: { type: String },
});

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    class: { type: String, required: false, default: "" }, // ✅ fixed - not required
    examName: { type: String, required: true },
    examType: { type: String, enum: ["midterm", "final", "unit", "practical"], default: "midterm" },
    session: { type: String, required: true },
    subjects: [subjectMarkSchema],
    totalMarksObtained: { type: Number },
    totalMarks: { type: Number },
    percentage: { type: Number },
    overallGrade: { type: String },
    remarks: { type: String, default: "" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

resultSchema.pre("save", function (next) {
  if (this.subjects && this.subjects.length > 0) {
    this.subjects = this.subjects.map((s) => ({
      ...s.toObject(),
      grade: calculateGrade((s.marksObtained / s.totalMarks) * 100),
    }));
    this.totalMarksObtained = this.subjects.reduce((a, s) => a + s.marksObtained, 0);
    this.totalMarks = this.subjects.reduce((a, s) => a + s.totalMarks, 0);
    this.percentage = parseFloat(((this.totalMarksObtained / this.totalMarks) * 100).toFixed(2));
    this.overallGrade = calculateGrade(this.percentage);
  }
  next();
});

function calculateGrade(percentage) {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
}

module.exports = mongoose.model("Result", resultSchema);