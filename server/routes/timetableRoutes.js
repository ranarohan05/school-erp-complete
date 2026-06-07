const express = require("express");
const router  = express.Router();
const {
  createOrUpdate, getByClass, getByTeacher, getAll, deleteDay
} = require("../controllers/timetableController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/",                   protect, authorizeRoles("admin" ,"teacher"), createOrUpdate);
router.get("/all",                 protect, authorizeRoles("admin"), getAll);
router.get("/teacher",             protect, authorizeRoles("teacher"), getByTeacher);
router.get("/class/:class",        protect, getByClass);
router.delete("/:id",              protect, authorizeRoles("admin" ,"teacher"), deleteDay);

module.exports = router;