const express = require("express");
const {
  createCurrentAccount,
  getCurrentAccounts,
  getCurrentAccount,
} = require("../controllers/current-account");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authenticateToken, createCurrentAccount);
router.get("/", authenticateToken, getCurrentAccounts);
router.get("/:id", authenticateToken, getCurrentAccount);

module.exports = router;
