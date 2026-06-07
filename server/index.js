const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const homeworkRoutes = require("./routes/homeworkRoutes");
const resultRoutes = require("./routes/resultRoutes");
const feeRoutes = require("./routes/feeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const achievementRoutes = require("./routes/achievementRoutes");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/fee", feeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/achievements", achievementRoutes);


app.get("/", (req, res) => res.json({ message: "School ERP API running ✅" }));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ DB connection error:", err));