const express = require("express");
const {
  createCashItem,
  getCashItems,
  getCashItem,
} = require("../controllers/cash-item");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authenticateToken, createCashItem);
router.get("/", authenticateToken, getCashItems);
router.get("/:id", authenticateToken, getCashItem);

module.exports = router;
