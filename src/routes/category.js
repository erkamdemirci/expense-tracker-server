const express = require("express");
const {
  createCategory,
  getCategories,
  getMostExpenseCategories,
  getCategory,
  updateCategory,
} = require("../controllers/category");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authenticateToken, createCategory);
router.get("/", authenticateToken, getCategories);
router.get("/most-expense", authenticateToken, getMostExpenseCategories);
router.get("/:id", authenticateToken, getCategory);
router.put("/:id", authenticateToken, updateCategory);

module.exports = router;
