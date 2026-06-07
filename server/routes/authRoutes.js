const express = require("express");
const router = express.Router();
const { register, login, getMe, adminCreateUser, getStudents, getTeachers, updateStudent, deleteStudent } = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");



router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/admin/create-user", protect, authorizeRoles("admin", "teacher"), adminCreateUser);
router.get("/students", protect, authorizeRoles("teacher", "admin"), getStudents);
router.get("/teachers", protect, getTeachers);
router.put("/students/:id", protect, authorizeRoles("teacher", "admin"), updateStudent);
router.delete("/students/:id", protect, authorizeRoles("teacher", "admin"), deleteStudent);

module.exports = router;