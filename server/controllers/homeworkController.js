const Homework = require("../models/Homework");

const createHomework = async (req, res) => {
  try {
    const { title, description, subject, class: cls, dueDate } = req.body;
    if (!title || !description || !subject || !cls || !dueDate)
      return res.status(400).json({ message: "All fields are required" });
    const homework = await Homework.create({
      title, description, subject, class: cls, dueDate,
      assignedBy: req.user._id,
    });
    res.status(201).json({ success: true, homework });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAllHomework = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "teacher") query.assignedBy = req.user._id;
    if (req.user.role === "student") query.class = req.user.class;
    if (req.user.role === "parent" && req.user.childId) {
      const User = require("../models/User");
      const child = await User.findById(req.user.childId);
      if (child) query.class = child.class;
    }
    const homeworks = await Homework.find(query)
      .populate("assignedBy", "name subject")
      .sort({ createdAt: -1 });
    res.json({ success: true, homeworks });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const submitHomework = async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id);
    if (!homework) return res.status(404).json({ message: "Homework not found" });
    const alreadySubmitted = homework.submissions.find(
      (s) => s.student.toString() === req.user._id.toString()
    );
    if (alreadySubmitted)
      return res.status(400).json({ message: "Already submitted" });
    const isLate = new Date() > new Date(homework.dueDate);
    homework.submissions.push({
      student: req.user._id,
      note: req.body.note || "",
      status: isLate ? "late" : "submitted",
    });
    await homework.save();
    res.json({ success: true, message: isLate ? "Submitted (late)" : "Submitted on time!" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getSubmissions = async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id)
      .populate("submissions.student", "name rollNumber class");
    if (!homework) return res.status(404).json({ message: "Homework not found" });
    res.json({ success: true, homework });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteHomework = async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id);
    if (!homework) return res.status(404).json({ message: "Homework not found" });
    if (req.user.role === "teacher" &&
        homework.assignedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    await homework.deleteOne();
    res.json({ success: true, message: "Homework deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { createHomework, getAllHomework, submitHomework, getSubmissions, deleteHomework };