const Timetable = require("../models/Timetable");

// Admin/Teacher creates or updates timetable for a class+day
exports.createOrUpdate = async (req, res) => {
  try {
    const { class: cls, day, periods, session } = req.body;
    const existing = await Timetable.findOne({ class: cls, day });
    if (existing) {
      existing.periods   = periods;
      existing.session   = session || existing.session;
      existing.createdBy = req.user.id;
      await existing.save();
      return res.json({ success: true, data: existing });
    }
    const tt = await Timetable.create({ class: cls, day, periods, session, createdBy: req.user.id });
    res.status(201).json({ success: true, data: tt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get full weekly timetable for a class
exports.getByClass = async (req, res) => {
  try {
    const { class: cls } = req.params;
    const data = await Timetable.find({ class: cls }).sort({ day: 1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get timetable for a specific teacher (all classes where they teach)
exports.getByTeacher = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const all = await Timetable.find({ "periods.teacher": teacherId });
    res.json({ success: true, data: all });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all timetables (admin)
exports.getAll = async (req, res) => {
  try {
    const data = await Timetable.find().sort({ class: 1, day: 1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a day's timetable
exports.deleteDay = async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};