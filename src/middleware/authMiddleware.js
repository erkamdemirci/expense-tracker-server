// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    const now = new Date();
    if (!user) {
      return res.status(401).json({ error: "Unauthorized", code: 401 });
    }

    if (decoded.exp <= now.getTime() / 1000) {
      return res.status(401).json({ error: "Unauthorized", code: 401 });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = authenticateToken;
