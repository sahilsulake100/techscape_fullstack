const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  checkUsername,
  getCandidatesByRole,
} = require("../controllers/user.controller");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/username/check", checkUsername);
router.get("/role/:role", authMiddleware, getCandidatesByRole);
router.get("/:identifier", getProfile);
router.put("/:id", authMiddleware, updateProfile);

module.exports = router;
