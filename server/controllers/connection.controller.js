const Connection = require("../models/connection.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

// Offline connection requests in-memory cache
let memoryConnections = [];

// Helper to format connection request
const formatConnection = (conn) => {
  return {
    id: conn._id.toString(),
    from_user: conn.from_user?._id?.toString() || conn.from_user?.toString(),
    to_user: conn.to_user?._id?.toString() || conn.to_user?.toString(),
    status: conn.status,
    createdAt: conn.createdAt || new Date(),
  };
};

// @desc    Send a connection request
// @route   POST /api/connections
// @access  Private
exports.sendRequest = async (req, res) => {
  try {
    const { from_user, to_user } = req.body;

    if (!from_user || !to_user) {
      return res.status(400).json({ message: "From and To users are required" });
    }

    if (mongoose.connection.readyState !== 1) {
      const existing = memoryConnections.find(
        c => (c.from_user === from_user && c.to_user === to_user) ||
             (c.from_user === to_user && c.to_user === from_user)
      );

      if (existing) {
        return res.status(400).json({ message: "Connection request already exists or you are already connected" });
      }

      const conn = {
        _id: new mongoose.Types.ObjectId(),
        from_user,
        to_user,
        status: "pending",
        createdAt: new Date()
      };
      memoryConnections.push(conn);
      return res.status(201).json(formatConnection(conn));
    }

    // Check if request already exists
    const existing = await Connection.findOne({
      $or: [
        { from_user: from_user, to_user: to_user },
        { from_user: to_user, to_user: from_user },
      ],
    });

    if (existing) {
      return res.status(400).json({ message: "Connection request already exists or you are already connected" });
    }

    const conn = await Connection.create({
      from_user,
      to_user,
      status: "pending",
    });

    res.status(201).json(formatConnection(conn));
  } catch (error) {
    console.error("SendRequest error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get connection status between two users
// @route   GET /api/connections/status
// @access  Private
exports.getStatus = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ message: "From and To query params are required" });
    }

    if (mongoose.connection.readyState !== 1) {
      const conn = memoryConnections.find(
        c => (c.from_user === from && c.to_user === to) ||
             (c.from_user === to && c.to_user === from)
      );
      if (!conn) return res.json({ status: "none" });
      return res.json({ status: conn.status, id: conn._id });
    }

    const conn = await Connection.findOne({
      $or: [
        { from_user: from, to_user: to },
        { from_user: to, to_user: from },
      ],
    });

    if (!conn) {
      return res.json({ status: "none" });
    }

    res.json({ status: conn.status, id: conn._id });
  } catch (error) {
    console.error("GetStatus error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get pending requests for a user
// @route   GET /api/connections/pending/:uid
// @access  Private
exports.getPending = async (req, res) => {
  try {
    const { uid } = req.params;

    if (mongoose.connection.readyState !== 1) {
      const pending = memoryConnections.filter(c => c.to_user === uid && c.status === "pending");
      
      // Let's resolve the 'from_user' profile info in offline mode
      const result = pending.map(p => {
        // Find if candidate exists
        const userProfiles = require("./user.controller");
        // We can just create a basic mockup profile for candidate sender
        return {
          id: p._id.toString(),
          from_user: p.from_user,
          to_user: p.to_user,
          status: p.status,
          profile: {
            id: p.from_user,
            full_name: "Collaborator Request",
            username: "collaborator",
            avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.from_user}`
          }
        };
      });

      return res.json(result);
    }

    const pending = await Connection.find({ to_user: uid, status: "pending" })
      .populate("from_user", "full_name username avatar_url");

    res.json(pending.map(p => ({
      id: p._id.toString(),
      from_user: p.from_user._id.toString(),
      to_user: p.to_user.toString(),
      status: p.status,
      profile: {
        id: p.from_user._id.toString(),
        full_name: p.from_user.full_name,
        username: p.from_user.username,
        avatar_url: p.from_user.avatar_url,
      }
    })));
  } catch (error) {
    console.error("GetPending error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update connection request status
// @route   PUT /api/connections/:id
// @access  Private
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (mongoose.connection.readyState !== 1) {
      const conn = memoryConnections.find(c => c._id.toString() === req.params.id);
      if (!conn) return res.status(404).json({ message: "Connection request not found" });
      
      conn.status = status;
      return res.json(formatConnection(conn));
    }

    const conn = await Connection.findById(req.params.id);
    if (!conn) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    conn.status = status;
    await conn.save();

    res.json(formatConnection(conn));
  } catch (error) {
    console.error("UpdateStatus error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get accepted connection IDs for a user
// @route   GET /api/connections/accepted/:uid
// @access  Private
exports.getAccepted = async (req, res) => {
  try {
    const { uid } = req.params;

    if (mongoose.connection.readyState !== 1) {
      const conns = memoryConnections.filter(
        c => (c.from_user === uid && c.status === "accepted") ||
             (c.to_user === uid && c.status === "accepted")
      );
      return res.json(conns.map(c => c.from_user === uid ? c.to_user : c.from_user));
    }

    const conns = await Connection.find({
      $or: [
        { from_user: uid, status: "accepted" },
        { to_user: uid, status: "accepted" },
      ],
    });

    const connectedUserIds = conns.map((c) => {
      return c.from_user.toString() === uid ? c.to_user.toString() : c.from_user.toString();
    });

    res.json(connectedUserIds);
  } catch (error) {
    console.error("GetAccepted error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
