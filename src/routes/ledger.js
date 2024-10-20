const express = require("express");
const {
  createLedger,
  getLedgers,
  getLedger,
  newLedgerInvite,
  deleteUserFromLedger,
  answerLedgerInvite,
  cancelLedgerInvite,
} = require("../controllers/ledger");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authenticateToken, createLedger);
router.get("/", authenticateToken, getLedgers);
router.get("/:id", authenticateToken, getLedger);
router.post("/:id/invite", authenticateToken, newLedgerInvite);
router.delete("/:id/user/:userId", authenticateToken, deleteUserFromLedger);
router.post("/:id/invite/:inviteId", authenticateToken, answerLedgerInvite);
router.delete("/:id/invite/:inviteId", authenticateToken, cancelLedgerInvite);
module.exports = router;
