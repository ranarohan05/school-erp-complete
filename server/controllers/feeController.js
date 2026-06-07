const Fee = require("../models/Fee");
const User = require("../models/User");

// ── Admin: Create fee record for a student ───────────────────────────────────
const createFee = async (req, res) => {
  try {
    const { studentId, month, session, totalAmount, discount, dueDate } = req.body;
    if (!studentId || !month || !session || !totalAmount || !dueDate)
      return res.status(400).json({ message: "All fields are required" });

    const student = await User.findById(studentId);
    if (!student || student.role !== "student")
      return res.status(404).json({ message: "Student not found" });

    const existing = await Fee.findOne({ student: studentId, month, session });
    if (existing)
      return res.status(400).json({ message: "Fee record already exists for this month" });

    const fee = await Fee.create({
      student: studentId, class: student.class,
      month, session, totalAmount, discount: discount || 0, dueDate,
      createdBy: req.user._id,
    });
    await fee.populate("student", "name rollNumber class");
    res.status(201).json({ success: true, fee });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Get fees (role-based) ────────────────────────────────────────────────────
const getFees = async (req, res) => {
  try {
    let fees = [];
    if (req.user.role === "student") {
      fees = await Fee.find({ student: req.user._id }).sort({ createdAt: -1 });
    }
    if (req.user.role === "admin" || req.user.role === "teacher") {
      const { studentId, status, class: cls, session } = req.query;
      let query = {};
      if (studentId) query.student = studentId;
      if (status)    query.status = status;
      if (cls)       query.class = cls;
      if (session)   query.session = session;
      fees = await Fee.find(query)
        .populate("student", "name rollNumber class")
        .sort({ createdAt: -1 });
    }
    if (req.user.role === "parent" && req.user.childId) {
      fees = await Fee.find({ student: req.user.childId }).sort({ createdAt: -1 });
    }
    res.json({ success: true, fees });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Admin: Record a payment ──────────────────────────────────────────────────
const recordPayment = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ message: "Fee record not found" });
    if (fee.status === "paid")
      return res.status(400).json({ message: "Fee already fully paid" });

    const { amount, method, note } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Valid amount required" });

    const receiptNo = `RCP-${Date.now()}`;
    fee.payments.push({ amount, method: method || "cash", note: note || "", receiptNo });
    await fee.save();
    await fee.populate("student", "name rollNumber class");
    res.json({ success: true, message: "Payment recorded!", fee, receiptNo });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Delete fee record (admin only) ──────────────────────────────────────────
const deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ message: "Fee record not found" });
    await fee.deleteOne();
    res.json({ success: true, message: "Fee record deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Get fee summary stats (admin) ────────────────────────────────────────────
const getFeeStats = async (req, res) => {
  try {
    const total    = await Fee.countDocuments();
    const paid     = await Fee.countDocuments({ status: "paid" });
    const unpaid   = await Fee.countDocuments({ status: "unpaid" });
    const partial  = await Fee.countDocuments({ status: "partial" });
    const allFees  = await Fee.find();
    const totalCollected = allFees.reduce((a, f) => a + f.paidAmount, 0);
    const totalDue       = allFees.reduce((a, f) => a + (f.totalAmount - f.discount - f.paidAmount), 0);
    res.json({ success: true, stats: { total, paid, unpaid, partial, totalCollected, totalDue } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { createFee, getFees, recordPayment, deleteFee, getFeeStats };
