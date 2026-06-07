const express = require("express");
const router  = express.Router();
const { createNotice, getAllNotices, getMyNotices, deleteNotice } = require("../controllers/noticeController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/",       protect, authorizeRoles("teacher","admin"), createNotice);
router.get("/all",     protect, authorizeRoles("teacher","admin"), getAllNotices);
router.get("/my",      protect, getMyNotices);
router.delete("/:id",  protect, authorizeRoles("teacher","admin"), deleteNotice);

module.exports = router;