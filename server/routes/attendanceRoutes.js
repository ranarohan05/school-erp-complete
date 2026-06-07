const express = require("express");
const router = express.Router();
const { markAttendance, getMyAttendance } = require("../controllers/attendanceController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/mark", protect, authorizeRoles("teacher"), markAttendance);
router.get("/my", protect, getMyAttendance);

module.exports = router;