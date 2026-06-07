const express = require("express");
const router = express.Router();
const {
  uploadResult, getResults, getResultById,
  getStudents, deleteResult,
} = require("../controllers/resultController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/students", authorizeRoles("teacher", "admin"), getStudents);
router.get("/", getResults);
router.get("/:id", getResultById);
router.post("/", authorizeRoles("teacher", "admin"), uploadResult);
router.delete("/:id", authorizeRoles("admin"), deleteResult);

module.exports = router;