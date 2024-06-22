const express = require("express");
const { getGoals, getGoal } = require("../controllers/goal");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", authenticateToken, getGoals);
router.get("/:id", authenticateToken, getGoal);

module.exports = router;
