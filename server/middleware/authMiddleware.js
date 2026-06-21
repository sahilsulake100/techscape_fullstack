const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallbacksecret");
    
    if (require("mongoose").connection.readyState !== 1) {
      const { memoryUsers } = require("../controllers/auth.controller");
      let user = memoryUsers[decoded.id];
      if (!user) {
        user = {
          _id: decoded.id,
          email: "developer@techscape.com",
          full_name: "Developer",
          username: "developer",
          avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=developer",
          role: "frontend",
          skills: [],
          projects: []
        };
        memoryUsers[decoded.id] = user;
      }
      req.user = user;
      return next();
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Token is not valid, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
