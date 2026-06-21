const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallbacksecret", { expiresIn: "30d" });
};

// Map backend user to Clerk-like properties for frontend compatibility
const formatUserResponse = (user) => {
  return {
    id: user._id.toString(),
    fullName: user.full_name || "",
    firstName: (user.full_name || "").split(" ")[0] || "",
    imageUrl: user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.username || user.email)}`,
    primaryEmailAddress: {
      emailAddress: user.email,
    },
    username: user.username || "",
    email: user.email,
    role: user.role || "frontend",
    college: user.college || "",
    location: user.location || "",
    bio: user.bio || "",
    skills: user.skills || [],
    projects: user.projects || [],
    linkedin: user.linkedin || "",
    instagram: user.instagram || "",
  };
};

// Memory database for registered users in offline mode
let memoryUsers = {};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, full_name, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const lowerEmail = email.toLowerCase().trim();
    const generatedUsername = username ? username.toLowerCase().trim() : lowerEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");

    if (mongoose.connection.readyState !== 1) {
      // Offline fallback: Check memory cache
      if (memoryUsers[lowerEmail]) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const mockId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: mockId,
        email: lowerEmail,
        full_name: full_name || generatedUsername,
        username: generatedUsername,
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(generatedUsername)}`,
        role: "frontend",
        skills: [],
        projects: [],
      };

      memoryUsers[lowerEmail] = mockUser;
      memoryUsers[mockId.toString()] = mockUser;

      return res.status(201).json({
        token: generateToken(mockId.toString()),
        user: formatUserResponse(mockUser),
      });
    }

    // Check if user exists in MongoDB
    const userExists = await User.findOne({ email: lowerEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    if (username) {
      const usernameExists = await User.findOne({ username: generatedUsername });
      if (usernameExists) {
        return res.status(400).json({ message: "Username is already taken" });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.create({
      email: lowerEmail,
      password: hashedPassword,
      full_name: full_name || generatedUsername,
      username: generatedUsername,
      avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(generatedUsername)}`,
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const lowerEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState !== 1) {
      // Offline fallback: Auto-register user to make offline testing smooth
      let user = memoryUsers[lowerEmail];
      if (!user) {
        const mockId = new mongoose.Types.ObjectId();
        const generatedUsername = lowerEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
        user = {
          _id: mockId,
          email: lowerEmail,
          full_name: generatedUsername,
          username: generatedUsername,
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(generatedUsername)}`,
          role: "frontend",
          skills: [],
          projects: [],
        };
        memoryUsers[lowerEmail] = user;
        memoryUsers[mockId.toString()] = user;
      }

      return res.json({
        token: generateToken(user._id.toString()),
        user: formatUserResponse(user),
      });
    }

    const user = await User.findOne({ email: lowerEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({
      token: generateToken(user._id),
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get current user details
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const userIdStr = req.user._id.toString();

    if (mongoose.connection.readyState !== 1) {
      let user = memoryUsers[userIdStr];
      if (!user) {
        user = {
          _id: new mongoose.Types.ObjectId(userIdStr),
          email: "developer@techscape.com",
          full_name: "Developer",
          username: "developer",
          avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=developer",
          role: "frontend",
          skills: [],
          projects: []
        };
        memoryUsers[userIdStr] = user;
      }
      return res.json(formatUserResponse(user));
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(formatUserResponse(user));
  } catch (error) {
    console.error("GetMe error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.formatUserResponse = formatUserResponse;
exports.memoryUsers = memoryUsers;
