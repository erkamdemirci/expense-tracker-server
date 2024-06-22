// routes/auth.js
const express = require("express");
const {
  signup,
  login,
  googleLogin,
  checkUsernameAvailability,
} = require("../controllers/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.get("/check-username", checkUsernameAvailability);

module.exports = router;
