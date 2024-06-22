const express = require("express");
const {
  createLedger,
  getLedgers,
  getLedger,
} = require("../controllers/ledger");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authenticateToken, createLedger);
router.get("/", authenticateToken, getLedgers);
router.get("/:id", authenticateToken, getLedger);

module.exports = router;
