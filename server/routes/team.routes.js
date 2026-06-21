const express = require("express");
const router = express.Router();
const {
  getTeams,
  getTeamById,
  createTeam,
  addMember,
  getUserTeams,
} = require("../controllers/team.controller");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.get("/", getTeams);
router.get("/:id", getTeamById);

// Private routes
router.post("/", authMiddleware, createTeam);
router.post("/:id/members", authMiddleware, addMember);
router.get("/user/:uid", authMiddleware, getUserTeams);

module.exports = router;
