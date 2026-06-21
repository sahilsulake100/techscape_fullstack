const Team = require("../models/team.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

// Curated Mock Teams for offline fallback
const mockTeams = [
  {
    _id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000011"),
    name: "AI Cyberpunk Labs",
    description: "Building a next-generation neural chat companion for the Global AI Hackathon.",
    skills_needed: ["Python", "PyTorch", "React", "AI"],
    max_members: 5,
    leader_id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000000"),
    leader_name: "Alice Watson",
    members: [new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000000")]
  },
  {
    _id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000012"),
    name: "Pixel Pioneers",
    description: "Designing the cleanest, most performant responsive SaaS template using Vite + React.",
    skills_needed: ["Vite", "TailwindCSS", "UI/UX", "React"],
    max_members: 3,
    leader_id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000050"),
    leader_name: "Bob Smith",
    members: [
      new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000050"),
      new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000060")
    ]
  }
];

// Memory database for newly created teams in offline mode
let memoryTeams = [];

// Helper to format team for client compatibility
const formatTeam = (team) => {
  return {
    id: team._id.toString(),
    name: team.name,
    description: team.description,
    skills_needed: team.skills_needed,
    max_members: team.max_members,
    leader_id: team.leader_id?._id?.toString() || team.leader_id?.toString(),
    leader_name: team.leader_name,
    members: (team.members || []).map((m) => {
      if (typeof m === "object" && m !== null) {
        return m._id?.toString() || m.toString();
      }
      return m.toString();
    }),
    createdAt: team.createdAt || new Date(),
  };
};

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public
exports.getTeams = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("Mongoose offline: returning mock teams");
      return res.json([...memoryTeams, ...mockTeams].map(formatTeam));
    }

    const teams = await Team.find().populate("members", "full_name username avatar_url");
    res.json(teams.map(formatTeam));
  } catch (error) {
    console.error("GetTeams error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get team by ID
// @route   GET /api/teams/:id
// @access  Public
exports.getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState !== 1) {
      const match = [...memoryTeams, ...mockTeams].find(t => t._id.toString() === id);
      if (!match) return res.status(404).json({ message: "Team not found" });
      return res.json(formatTeam(match));
    }

    const team = await Team.findById(id)
      .populate("leader_id", "full_name username avatar_url")
      .populate("members", "full_name username avatar_url");
      
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.json(formatTeam(team));
  } catch (error) {
    console.error("GetTeamById error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private
exports.createTeam = async (req, res) => {
  try {
    const { name, description, skills_needed, max_members } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    if (mongoose.connection.readyState !== 1) {
      const newTeam = {
        _id: new mongoose.Types.ObjectId(),
        name,
        description,
        skills_needed: Array.isArray(skills_needed) ? skills_needed : [],
        max_members: max_members ? Number(max_members) : 5,
        leader_id: req.user._id,
        leader_name: req.user.full_name || req.user.username || "Me",
        members: [req.user._id],
        createdAt: new Date()
      };
      memoryTeams.unshift(newTeam);
      return res.status(201).json(formatTeam(newTeam));
    }

    const team = await Team.create({
      name,
      description,
      skills_needed: Array.isArray(skills_needed) ? skills_needed : [],
      max_members: max_members ? Number(max_members) : 5,
      leader_id: req.user._id,
      leader_name: req.user.full_name || req.user.username,
      members: [req.user._id],
    });

    const populatedTeam = await Team.findById(team._id).populate("members", "full_name username avatar_url");
    res.status(201).json(formatTeam(populatedTeam));
  } catch (error) {
    console.error("CreateTeam error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add member to team
// @route   POST /api/teams/:id/members
// @access  Private
exports.addMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    if (!memberId) {
      return res.status(400).json({ message: "Member ID is required" });
    }

    if (mongoose.connection.readyState !== 1) {
      const match = [...memoryTeams, ...mockTeams].find(t => t._id.toString() === req.params.id);
      if (!match) return res.status(404).json({ message: "Team not found" });
      
      const mId = new mongoose.Types.ObjectId(memberId);
      if (!match.members.some(m => m.toString() === memberId)) {
        match.members.push(mId);
      }
      return res.json(formatTeam(match));
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.members.length >= team.max_members) {
      return res.status(400).json({ message: "Team is already at maximum capacity" });
    }

    if (team.members.includes(memberId)) {
      return res.status(400).json({ message: "User is already a member of this team" });
    }

    team.members.push(memberId);
    await team.save();

    res.json(formatTeam(team));
  } catch (error) {
    console.error("AddMember error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user's teams
// @route   GET /api/teams/user/:uid
// @access  Private
exports.getUserTeams = async (req, res) => {
  try {
    const { uid } = req.params;

    if (mongoose.connection.readyState !== 1) {
      const matches = [...memoryTeams, ...mockTeams].filter(
        t => t.members.some(m => m.toString() === uid)
      );
      return res.json(matches.map(formatTeam));
    }

    const teams = await Team.find({ members: uid }).populate("members", "full_name username avatar_url");
    res.json(teams.map(formatTeam));
  } catch (error) {
    console.error("GetUserTeams error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
