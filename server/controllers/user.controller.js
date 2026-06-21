const User = require("../models/user.model");
const { formatUserResponse } = require("./auth.controller");
const mongoose = require("mongoose");

// Curated Mock Candidates for offline fallback (including Alice Watson)
const mockCandidates = [
  {
    _id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000000"),
    full_name: "Alice Watson",
    username: "alice_watson",
    role: "fullstack",
    college: "Stanford University",
    location: "San Francisco, CA",
    bio: "Lead Developer at TechScape. Love building hacker communities.",
    skills: ["React", "Node.js", "GraphQL", "MongoDB"],
    projects: ["TechScape Platform", "Hackathon Board Hub"],
    email: "alice@techscape.io",
    avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=alice_watson",
  },
  {
    _id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000050"),
    full_name: "Alice Smith",
    username: "alice_smith",
    role: "frontend",
    college: "Stanford University",
    location: "Stanford, CA",
    bio: "Passionate front-end developer skilled in React, Tailwind, and Vite.",
    skills: ["React", "CSS", "Tailwind", "JavaScript"],
    projects: ["Portfolio Website v2", "Cryptocurrency Tracker Dashboard"],
    email: "alice@stanford.edu",
    avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=alice_smith",
  },
  {
    _id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000060"),
    full_name: "Bob Jones",
    username: "bobjones",
    role: "backend",
    college: "MIT",
    location: "Cambridge, MA",
    bio: "Node.js wizard working on distributed web scrapers and secure APIs.",
    skills: ["Node.js", "Express", "MongoDB", "PostgreSQL"],
    projects: ["TechScape REST API Core", "Real-time Chat Socket Server"],
    email: "bob@mit.edu",
    avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=bobjones",
  },
  {
    _id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000070"),
    full_name: "Charlie Brown",
    username: "charlie_b",
    role: "designer",
    college: "UC Berkeley",
    location: "Berkeley, CA",
    bio: "UI/UX enthusiast designed dashboards and hackathon platform wireframes.",
    skills: ["Figma", "Illustrator", "TailwindCSS", "Prototyping"],
    projects: ["TechScape Design System UI Kit", "Mobile Food Delivery App UX"],
    email: "charlie@berkeley.edu",
    avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=charlie_b",
  }
];

// Offline user profiles cache in memory
let memoryProfiles = {};

// @desc    Get user profile by ID or username
// @route   GET /api/profiles/:identifier
// @access  Public
exports.getProfile = async (req, res) => {
  try {
    const { identifier } = req.params;

    if (mongoose.connection.readyState !== 1) {
      // 1. Look up in memory cache first
      if (memoryProfiles[identifier]) {
        return res.json(memoryProfiles[identifier]);
      }
      
      // 2. Look up in mock candidates
      const match = mockCandidates.find(
        c => c._id.toString() === identifier || c.username === identifier.toLowerCase()
      );
      if (match) {
        return res.json(formatUserResponse(match));
      }

      // 3. Look up in memory users from auth controller
      const { memoryUsers } = require("./auth.controller");
      if (memoryUsers[identifier]) {
        const userObj = memoryUsers[identifier];
        return res.json(formatUserResponse(userObj));
      }

      // 4. Default mock user if not found but is a valid ObjectId (helps prevent 404 console spam)
      if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        const tempUser = {
          _id: new mongoose.Types.ObjectId(identifier),
          email: "developer@techscape.com",
          full_name: "Developer Friend",
          username: "developer_friend_" + identifier.substring(18),
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${identifier}`,
          role: "frontend",
          skills: ["HTML", "CSS", "React"],
          projects: []
        };
        return res.json(formatUserResponse(tempUser));
      }

      // 5. Default mock user if not found but is a username string (helps prevent 404 profiles)
      if (typeof identifier === "string" && identifier.length > 0) {
        const mockId = new mongoose.Types.ObjectId();
        const cleanUsername = identifier.toLowerCase().trim();
        const readableName = identifier
          .split(/[_\d]+/)
          .filter(Boolean)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ") || identifier;

        const tempUser = {
          _id: mockId,
          email: `${cleanUsername}@techscape.com`,
          full_name: readableName,
          username: cleanUsername,
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanUsername}`,
          role: "frontend",
          skills: ["HTML", "CSS", "React", "JavaScript"],
          projects: [],
          bio: `Passionate developer profile for ${readableName}.`
        };

        const formatted = formatUserResponse(tempUser);
        memoryProfiles[cleanUsername] = formatted;
        memoryProfiles[mockId.toString()] = formatted;

        const { memoryUsers } = require("./auth.controller");
        memoryUsers[mockId.toString()] = tempUser;
        memoryUsers[cleanUsername] = tempUser;

        return res.json(formatted);
      }
      
      // Return 404 only as a last resort
      return res.status(404).json({ message: "Profile not found" });
    }

    let user;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(identifier);
    } else {
      user = await User.findOne({ username: identifier.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(formatUserResponse(user));
  } catch (error) {
    console.error("GetProfile error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create or update user profile
// @route   PUT /api/profiles/:id
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure authorized user is modifying their own profile
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Not authorized to update this profile" });
    }

    const {
      full_name,
      username,
      role,
      college,
      location,
      bio,
      skills,
      projects,
      linkedin,
      instagram,
    } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const parsedUsername = username ? username.toLowerCase().replace(/\s+/g, "") : req.user.username;
      
      const updatedMockProfile = {
        id,
        _id: id,
        full_name: full_name || req.user.fullName,
        username: parsedUsername,
        role: role || req.user.role,
        college: college || "",
        location: location || "",
        bio: bio || "",
        skills: Array.isArray(skills) ? skills : [],
        projects: Array.isArray(projects) ? projects : [],
        linkedin: linkedin || "",
        instagram: instagram || "",
        email: req.user.email,
        avatar_url: req.user.imageUrl,
      };

      // Save to memory cache (both indexable by ID and by Username)
      memoryProfiles[id] = updatedMockProfile;
      memoryProfiles[parsedUsername] = updatedMockProfile;

      return res.json(updatedMockProfile);
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username) {
      const parsedUsername = username.toLowerCase().replace(/\s+/g, "");
      const existingUser = await User.findOne({
        username: parsedUsername,
        _id: { $ne: id },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      user.username = parsedUsername;
    }

    user.full_name = full_name !== undefined ? full_name : user.full_name;
    user.role = role !== undefined ? role : user.role;
    user.college = college !== undefined ? college : user.college;
    user.location = location !== undefined ? location : user.location;
    user.bio = bio !== undefined ? bio : user.bio;
    user.skills = Array.isArray(skills) ? skills : user.skills;
    user.projects = Array.isArray(projects) ? projects : user.projects;
    user.linkedin = linkedin !== undefined ? linkedin : user.linkedin;
    user.instagram = instagram !== undefined ? instagram : user.instagram;

    await user.save();

    res.json(formatUserResponse(user));
  } catch (error) {
    console.error("UpdateProfile error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Check if username is taken
// @route   GET /api/profiles/username/check
// @access  Public
exports.checkUsername = async (req, res) => {
  try {
    const { username, exclude } = req.query;
    if (!username) {
      return res.status(400).json({ message: "Username query parameter is required" });
    }

    const parsedUsername = username.toLowerCase().trim();

    if (mongoose.connection.readyState !== 1) {
      const takenInMemory = memoryProfiles[parsedUsername] && memoryProfiles[parsedUsername].id !== exclude;
      const takenInMock = mockCandidates.some(c => c.username === parsedUsername && c._id.toString() !== exclude);
      return res.json({ taken: takenInMemory || takenInMock });
    }

    const query = { username: parsedUsername };
    if (exclude) {
      query._id = { $ne: exclude };
    }

    const user = await User.findOne(query);
    res.json({ taken: !!user });
  } catch (error) {
    console.error("CheckUsername error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Fetch developer candidates by role
// @route   GET /api/profiles/role/:role
// @access  Private
exports.getCandidatesByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const excludeUid = req.user._id;

    if (mongoose.connection.readyState !== 1) {
      const matches = mockCandidates.filter(
        c => c.role.toLowerCase() === role.toLowerCase() && c._id.toString() !== excludeUid.toString()
      );
      return res.json(matches.map(formatUserResponse));
    }

    const users = await User.find({
      role: role.toLowerCase(),
      _id: { $ne: excludeUid },
    });

    res.json(users.map(formatUserResponse));
  } catch (error) {
    console.error("GetCandidatesByRole error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
