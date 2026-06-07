const Result = require("../models/Result");
const User = require("../models/User");

// ── Teacher/Admin: Upload result ─────────────────────────────────────────────
const uploadResult = async (req, res) => {
  try {
    const { studentId, examName, examType, session, subjects, remarks } = req.body;

    if (!studentId || !examName || !session || !subjects || subjects.length === 0)
      return res.status(400).json({ message: "All fields are required" });

    const student = await User.findById(studentId);
    if (!student || student.role !== "student")
      return res.status(404).json({ message: "Student not found" });

    // Check if result already exists for same student + exam + session
    const existing = await Result.findOne({ student: studentId, examName, session });
    if (existing)
      return res.status(400).json({ message: "Result already uploaded for this exam and session" });

    const result = await Result.create({
      student: studentId,
      class: student.class,
      examName, examType, session, subjects, remarks,
      uploadedBy: req.user._id,
    });

    await result.populate("student", "name rollNumber class");
    res.status(201).json({ success: true, result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get results (role-based) ─────────────────────────────────────────────────
const getResults = async (req, res) => {
  try {
    let results = [];

    if (req.user.role === "student") {
      results = await Result.find({ student: req.user._id })
        .populate("uploadedBy", "name")
        .sort({ createdAt: -1 });
    }

    if (req.user.role === "teacher" || req.user.role === "admin") {
      const { studentId, class: cls, session } = req.query;
      let query = {};
      if (studentId) query.student = studentId;
      if (cls) query.class = cls;
      if (session) query.session = session;
      results = await Result.find(query)
        .populate("student", "name rollNumber class")
        .populate("uploadedBy", "name")
        .sort({ createdAt: -1 });
    }

    if (req.user.role === "parent") {
      const parent = await User.findById(req.user._id);
      if (parent.childId) {
        results = await Result.find({ student: parent.childId })
          .populate("uploadedBy", "name")
          .sort({ createdAt: -1 });
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get single result ────────────────────────────────────────────────────────
const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate("student", "name rollNumber class")
      .populate("uploadedBy", "name");
    if (!result) return res.status(404).json({ message: "Result not found" });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get all students list (for teacher to pick) ──────────────────────────────
const getStudents = async (req, res) => {
  try {
    const { class: cls } = req.query;
    let query = { role: "student" };
    if (cls) query.class = cls;
    const students = await User.find(query).select("name rollNumber class email");
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Delete result (admin only) ───────────────────────────────────────────────
const deleteResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) return res.status(404).json({ message: "Result not found" });
    await result.deleteOne();
    res.json({ success: true, message: "Result deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { uploadResult, getResults, getResultById, getStudents, deleteResult };