const express = require("express");
const {
  createCashItem,
  getCashItems,
  getCashItem,
  updateCashItem,
} = require("../controllers/cash-item");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authenticateToken, createCashItem);
router.get("/", authenticateToken, getCashItems);
router.get("/:id", authenticateToken, getCashItem);
router.put("/:id", authenticateToken, updateCashItem);

module.exports = router;
