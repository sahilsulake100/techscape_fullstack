const Event = require("../models/event.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

// Curated Mock Events for offline fallback
const mockEvents = [
  {
    _id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000001"),
    title: "Global AI Hackathon 2026",
    description: "Join developers from around the world to build innovative AI applications using large language models, computer vision, and neural networks. Win prizes up to $50,000!",
    event_type: "hackathon",
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    location: "San Francisco, CA",
    is_virtual: false,
    registration_url: "https://ai-hackathon.com",
    max_participants: 1000,
    tags: ["AI", "Hackathon", "ML", "Python"],
    image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60",
    organizer_id: {
      _id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000000"),
      full_name: "OpenAI Developer Relations",
      username: "openai_devs",
      avatar_url: ""
    },
    watchlisted_by: []
  },
  {
    _id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000002"),
    title: "Vite + React Performance Workshop",
    description: "Learn how to build blindingly fast web applications using Vite's modern bundle optimization features and React's new concurrent rendering patterns.",
    event_type: "workshop",
    start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    location: "Online / Virtual",
    is_virtual: true,
    registration_url: "https://react-performance.org",
    max_participants: 500,
    tags: ["React", "Vite", "Performance", "Frontend"],
    image_url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60",
    organizer_id: {
      _id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000000"),
      full_name: "TechScape Academy",
      username: "techscape_edu",
      avatar_url: ""
    },
    watchlisted_by: []
  },
  {
    _id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000003"),
    title: "Algorithmic Code Sprint #45",
    description: "Compete in a 3-hour fast-paced algorithmic coding contest. Solve 6 competitive programming problems ranging from graph theory to dynamic programming.",
    event_type: "coding_contest",
    start_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    location: "Online / Remote",
    is_virtual: true,
    registration_url: "https://code-sprint.io",
    max_participants: 1500,
    tags: ["Algorithms", "C++", "Java", "Competitions"],
    image_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60",
    organizer_id: {
      _id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000000"),
      full_name: "Codeforces Hub",
      username: "codeforces",
      avatar_url: ""
    },
    watchlisted_by: []
  }
];

// Memory database for newly created events in offline mode
let memoryEvents = [];

// Helper to format event for client compatibility
const formatEvent = (event) => {
  return {
    id: event._id.toString(),
    title: event.title,
    description: event.description,
    event_type: event.event_type,
    start_date: event.start_date,
    end_date: event.end_date,
    location: event.location,
    is_virtual: event.is_virtual,
    registration_url: event.registration_url,
    max_participants: event.max_participants,
    tags: event.tags,
    image_url: event.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60",
    organizer: event.organizer_id ? {
      id: event.organizer_id._id?.toString() || event.organizer_id.toString(),
      full_name: event.organizer_id.full_name || "Organizer",
      username: event.organizer_id.username || "organizer",
      avatar_url: event.organizer_id.avatar_url || "",
    } : null,
    created_at: event.createdAt || new Date(),
  };
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("Mongoose offline: returning mock events");
      return res.json([...memoryEvents, ...mockEvents].map(formatEvent));
    }

    const events = await Event.find().populate("organizer_id", "full_name username avatar_url").sort({ start_date: 1 });
    res.json(events.map(formatEvent));
  } catch (error) {
    console.error("GetEvents error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState !== 1) {
      const match = [...memoryEvents, ...mockEvents].find(e => e._id.toString() === id);
      if (!match) return res.status(404).json({ message: "Event not found" });
      return res.json(formatEvent(match));
    }

    const event = await Event.findById(id).populate("organizer_id", "full_name username avatar_url");
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(formatEvent(event));
  } catch (error) {
    console.error("GetEventById error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get events by organizer ID
// @route   GET /api/events/organizer/:uid
// @access  Public
exports.getEventsByOrganizer = async (req, res) => {
  try {
    const { uid } = req.params;

    if (mongoose.connection.readyState !== 1) {
      const matches = [...memoryEvents, ...mockEvents].filter(
        e => (e.organizer_id._id?.toString() || e.organizer_id.toString()) === uid
      );
      return res.json(matches.map(formatEvent));
    }

    const events = await Event.find({ organizer_id: uid }).populate("organizer_id", "full_name username avatar_url");
    res.json(events.map(formatEvent));
  } catch (error) {
    console.error("GetEventsByOrganizer error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      event_type,
      start_date,
      end_date,
      location,
      is_virtual,
      registration_url,
      max_participants,
      tags,
      image_url,
    } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const newEvent = {
        _id: new mongoose.Types.ObjectId(),
        title,
        description,
        event_type,
        start_date: start_date || new Date(),
        end_date: end_date || new Date(),
        location: is_virtual ? "Online / Virtual" : (location || "TBD"),
        is_virtual: !!is_virtual,
        registration_url,
        max_participants: max_participants ? Number(max_participants) : null,
        tags: Array.isArray(tags) ? tags : [],
        image_url,
        organizer_id: {
          _id: req.user._id,
          full_name: req.user.full_name || "Me",
          username: req.user.username || "me",
          avatar_url: req.user.avatar_url || "",
        },
        watchlisted_by: []
      };
      memoryEvents.unshift(newEvent);
      return res.status(201).json(formatEvent(newEvent));
    }

    const event = await Event.create({
      title,
      description,
      event_type,
      start_date,
      end_date,
      location: is_virtual ? "Online / Virtual" : (location || "TBD"),
      is_virtual: !!is_virtual,
      registration_url,
      max_participants: max_participants ? Number(max_participants) : null,
      tags: Array.isArray(tags) ? tags : [],
      image_url,
      organizer_id: req.user._id,
    });

    const populatedEvent = await Event.findById(event._id).populate("organizer_id", "full_name username avatar_url");
    res.status(201).json(formatEvent(populatedEvent));
  } catch (error) {
    console.error("CreateEvent error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user watchlist
// @route   GET /api/events/watchlist/user/:uid
// @access  Private
exports.getWatchlist = async (req, res) => {
  try {
    const { uid } = req.params;

    if (mongoose.connection.readyState !== 1) {
      const matches = [...memoryEvents, ...mockEvents].filter(e => e.watchlisted_by.includes(uid));
      return res.json(matches.map(formatEvent));
    }

    const watchlisted = await Event.find({ watchlisted_by: uid }).populate("organizer_id", "full_name username avatar_url");
    res.json(watchlisted.map(formatEvent));
  } catch (error) {
    console.error("GetWatchlist error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add event to watchlist
// @route   POST /api/events/:id/watchlist
// @access  Private
exports.addToWatchlist = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState !== 1) {
      const match = [...memoryEvents, ...mockEvents].find(e => e._id.toString() === id);
      if (match && !match.watchlisted_by.includes(req.user._id.toString())) {
        match.watchlisted_by.push(req.user._id.toString());
      }
      return res.json({ message: "Added to watchlist successfully" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.watchlisted_by.includes(req.user._id)) {
      event.watchlisted_by.push(req.user._id);
      await event.save();
    }

    res.json({ message: "Added to watchlist successfully" });
  } catch (error) {
    console.error("AddToWatchlist error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Remove event from watchlist
// @route   DELETE /api/events/:id/watchlist
// @access  Private
exports.removeFromWatchlist = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState !== 1) {
      const match = [...memoryEvents, ...mockEvents].find(e => e._id.toString() === id);
      if (match) {
        match.watchlisted_by = match.watchlisted_by.filter(uid => uid !== req.user._id.toString());
      }
      return res.json({ message: "Removed from watchlist successfully" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.watchlisted_by = event.watchlisted_by.filter(
      (uid) => uid.toString() !== req.user._id.toString()
    );
    await event.save();

    res.json({ message: "Removed from watchlist successfully" });
  } catch (error) {
    console.error("RemoveFromWatchlist error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
