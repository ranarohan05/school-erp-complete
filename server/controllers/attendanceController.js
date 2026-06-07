const Attendance = require("../models/Attendance");

// Teacher marks attendance for a list of students
exports.markAttendance = async (req, res) => {
  try {
    const { records } = req.body;
    // records = [{ student, subject, date, status }]
    const saved = await Attendance.insertMany(
      records.map(r => ({ ...r, markedBy: req.user.id }))
    );
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student views their own attendance
exports.getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const records = await Attendance.find({ student: studentId }).sort({ date: -1 });

    // Subject-wise breakdown
    const subjectMap = {};
    records.forEach(r => {
      if (!subjectMap[r.subject]) subjectMap[r.subject] = { total: 0, present: 0 };
      subjectMap[r.subject].total++;
      if (r.status === "present" || r.status === "late") subjectMap[r.subject].present++;
    });
    const subjectStats = Object.entries(subjectMap).map(([subject, val]) => ({
      subject,
      total: val.total,
      present: val.present,
      percentage: Math.round((val.present / val.total) * 100),
    }));

    res.json({ success: true, records, subjectStats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};