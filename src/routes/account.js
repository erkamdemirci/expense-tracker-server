const express = require("express");
const {
  createAccount,
  getAccounts,
  getAccount,
} = require("../controllers/account");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authenticateToken, createAccount);
router.get("/", authenticateToken, getAccounts);
router.get("/:id", authenticateToken, getAccount);

module.exports = router;
