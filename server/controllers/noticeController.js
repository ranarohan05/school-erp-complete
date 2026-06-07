const Notice = require("../models/Notice");

// Create notice
exports.createNotice = async (req, res) => {
  try {
    const { title, message, targetType, targetClass, priority } = req.body;
    if (!title || !message) return res.status(400).json({ message: "Title and message are required" });
    const notice = await Notice.create({
      title, message, targetType, targetClass: targetType === "class" ? targetClass : "",
      priority: priority || "normal",
      createdBy: req.user._id,
      createdByName: req.user.name,
      createdByRole: req.user.role,
    });
    res.status(201).json({ success: true, notice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all notices (admin/teacher)
exports.getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json({ success: true, notices });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get notices for a student (all + their class)
exports.getMyNotices = async (req, res) => {
  try {
    const studentClass = req.user.class || "";
    const notices = await Notice.find({
      $or: [
        { targetType: "all" },
        { targetType: "class", targetClass: studentClass },
      ]
    }).sort({ createdAt: -1 });
    res.json({ success: true, notices });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete notice
exports.deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Notice deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
