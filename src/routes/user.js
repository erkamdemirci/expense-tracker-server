// routes/userRoutes.js
const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();
const {
  getUser,
  updateUser,
  getUsers,
  uploadAvatar,
  getAvatar,
} = require("../controllers/user");
const multer = require("multer");

router.get("/:id", authenticateToken, getUser);
router.put("/", authenticateToken, updateUser);
router.get("/", authenticateToken, getUsers);

router.post(
  "/upload-avatar",
  authenticateToken,
  upload.single("avatar"),
  uploadAvatar
);

router.get("/avatar", authenticateToken, getAvatar);

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading.
    console.error(err);
    return res.status(400).json({ error: "Multer error" });
  }
  next(err);
});

module.exports = router;
