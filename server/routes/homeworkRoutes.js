const express = require("express");
const router = express.Router();
const {
  createHomework, getAllHomework, submitHomework,
  getSubmissions, deleteHomework,
} = require("../controllers/homeworkController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", getAllHomework);
router.post("/", authorizeRoles("teacher", "admin"), createHomework);
router.post("/:id/submit", authorizeRoles("student"), submitHomework);
router.get("/:id/submissions", authorizeRoles("teacher", "admin"), getSubmissions);
router.delete("/:id", authorizeRoles("teacher", "admin"), deleteHomework);

module.exports = router;