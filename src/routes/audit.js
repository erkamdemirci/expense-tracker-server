// routes/auditRoutes.js
const express = require("express");
const AuditLog = require("../models/auditLog");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("user", "email username")
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
