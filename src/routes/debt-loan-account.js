const express = require("express");
const {
  createDebtLoanAccount,
  getDebtLoanAccounts,
  getDebtLoanAccount,
} = require("../controllers/debt-loan-account");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authenticateToken, createDebtLoanAccount);
router.get("/", authenticateToken, getDebtLoanAccounts);
router.get("/:id", authenticateToken, getDebtLoanAccount);

module.exports = router;
