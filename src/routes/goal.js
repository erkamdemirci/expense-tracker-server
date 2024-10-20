const express = require("express");
const { getGoals, getGoal, deleteGoal } = require("../controllers/goal");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", authenticateToken, getGoals);
router.get("/:id", authenticateToken, getGoal);
router.delete("/:id", authenticateToken, deleteGoal);

module.exports = router;
