const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const { getPayments, getPayment } = require("../controllers/payment");

router.get("/", authenticateToken, getPayments);
router.get("/:id", authenticateToken, getPayment);

module.exports = router;
