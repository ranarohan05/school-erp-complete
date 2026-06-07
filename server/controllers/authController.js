const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

const register = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, class: cls, subject, employeeId, phone } = req.body;
    if (role === "admin")
      return res.status(403).json({ message: "Cannot self-register as admin" });
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });
    const user = await User.create({ name, email, password, role, rollNumber, class: cls, subject, employeeId, phone });
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Please provide email and password" });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });
    if (!user.isActive)
      return res.status(403).json({ message: "Account is deactivated" });
    res.json({
      success: true,
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, profilePic: user.profilePic },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, class: cls, subject, employeeId, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });
    const user = await User.create({ name, email, password, role, rollNumber, class: cls, subject, employeeId, phone });
    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { name, email, class: cls, rollNumber, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, class: cls, rollNumber, phone },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "Student not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("-password");

    res.json({
      success: true,
      teachers,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  adminCreateUser,
  getStudents,
  updateStudent,
  deleteStudent,
  getTeachers,
};