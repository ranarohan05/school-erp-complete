const Achievement = require("../models/Achievement");
const User = require("../models/User");

exports.createAchievement = async (req, res) => {
  try {
    const { title, description, type, badge, awardedTo, awardedToRole, date, session } = req.body;
    const recipient = await User.findById(awardedTo);
    if (!recipient) return res.status(404).json({ message: "User not found" });
    const achievement = await Achievement.create({
      title, description, type, badge, awardedTo,
      awardedToName: recipient.name,
      awardedToRole: awardedToRole || recipient.role,
      awardedBy: req.user._id,
      awardedByName: req.user.name,
      date: date || Date.now(),
      session,
    });
    res.status(201).json({ success: true, achievement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllAchievements = async (req, res) => {
  try {
    const { role, session } = req.query;
    const filter = {};
    if (role) filter.awardedToRole = role;
    if (session) filter.session = session;
    const achievements = await Achievement.find(filter).sort({ date: -1 });
    res.json({ success: true, achievements });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ awardedTo: req.user._id }).sort({ date: -1 });
    res.json({ success: true, achievements });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAchievement = async (req, res) => {
  try {
    await Achievement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};