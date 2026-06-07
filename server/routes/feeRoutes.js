const express = require("express");
const router = express.Router();
const { createFee, getFees, recordPayment, deleteFee, getFeeStats } = require("../controllers/feeController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/stats", authorizeRoles("admin"), getFeeStats);
router.get("/", getFees);
router.post("/", authorizeRoles("admin"), createFee);
router.post("/:id/pay", authorizeRoles("admin"), recordPayment);
router.delete("/:id", authorizeRoles("admin"), deleteFee);

module.exports = router;
