const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const {
  getPayments,
  getPayment,
  updatePayment,
} = require("../controllers/payment");

router.get("/", authenticateToken, getPayments);
router.get("/:id", authenticateToken, getPayment);
router.put("/:id", authenticateToken, updatePayment);

module.exports = router;
