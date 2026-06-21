const express = require("express");
const router = express.Router();
const { getTeammateRecommendations } = require("../controllers/ai.controller");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/recommend-teammates/:teamId", authMiddleware, getTeammateRecommendations);

module.exports = router;
