const express = require("express");
const router  = express.Router();
const { createAchievement, getAllAchievements, getMyAchievements, deleteAchievement } = require("../controllers/achievementController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/",     protect, authorizeRoles("admin","teacher"), createAchievement);
router.get("/all",   protect, authorizeRoles("admin","teacher"), getAllAchievements);
router.get("/my",    protect, getMyAchievements);
router.delete("/:id",protect, authorizeRoles("admin","teacher"), deleteAchievement);

module.exports = router;