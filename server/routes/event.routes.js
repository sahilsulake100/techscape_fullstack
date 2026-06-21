const express = require("express");
const router = express.Router();
const {
  getEvents,
  getEventById,
  getEventsByOrganizer,
  createEvent,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} = require("../controllers/event.controller");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.get("/", getEvents);
router.get("/:id", getEventById);
router.get("/organizer/:uid", getEventsByOrganizer);

// Private routes
router.post("/", authMiddleware, createEvent);
router.get("/watchlist/user/:uid", authMiddleware, getWatchlist);
router.post("/:id/watchlist", authMiddleware, addToWatchlist);
router.delete("/:id/watchlist", authMiddleware, removeFromWatchlist);

module.exports = router;
