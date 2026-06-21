const mongoose = require("mongoose");
const Team = require("../models/team.model");
const User = require("../models/user.model");
const { calculateMatch } = require("../services/ai.service");

// @desc    Get AI teammate recommendations for a team
// @route   GET /api/ai/recommend-teammates/:teamId
// @access  Private
exports.getTeammateRecommendations = async (req, res) => {
  try {
    const { teamId } = req.params;
    let team = null;
    let candidates = [];

    // Offline Mongoose Fallback
    if (mongoose.connection.readyState !== 1) {
      console.log("Mongoose offline: generating recommendations from mock memory data");

      // Import memory stores from controllers
      const teamController = require("./team.controller");
      // Find team in memory
      // We search local variables inside team controller. But wait, since they are local inside team.controller.js, we can define a basic mock team if not found in db.
      // Let's create a robust mock lookup:
      const mockTeams = [
        {
          _id: "60c72b2f9b1d8b2bad000011",
          name: "AI Cyberpunk Labs",
          description: "Building a next-generation neural chat companion for the Global AI Hackathon.",
          skills_needed: ["Python", "PyTorch", "React", "AI"],
          open_roles: ["backend", "designer"],
          max_members: 5,
          leader_id: "60c72b2f9b1d8b2bad000000",
          members: ["60c72b2f9b1d8b2bad000000"]
        },
        {
          _id: "60c72b2f9b1d8b2bad000012",
          name: "Pixel Pioneers",
          description: "Designing the cleanest, most performant responsive SaaS template using Vite + React.",
          skills_needed: ["Vite", "TailwindCSS", "UI/UX", "React"],
          open_roles: ["designer"],
          max_members: 3,
          leader_id: "60c72b2f9b1d8b2bad000050",
          members: ["60c72b2f9b1d8b2bad000050", "60c72b2f9b1d8b2bad000060"]
        }
      ];

      const foundTeam = mockTeams.find(t => t._id === teamId);
      if (!foundTeam) {
        // Create a generic fallback team
        team = {
          _id: teamId,
          name: "Hacker Team",
          description: "Building a cool hackathon project.",
          skills_needed: ["React", "JavaScript", "HTML"],
          open_roles: ["frontend"],
          members: [req.user._id.toString()]
        };
      } else {
        team = foundTeam;
      }

      // Load mock candidates
      const userController = require("./user.controller");
      // Import mock candidates defined in user controller
      // We can construct a list of mock users:
      const mockDevs = [
        {
          _id: "60c72b2f9b1d8b2bad000050",
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
          experience_level: "intermediate"
        },
        {
          _id: "60c72b2f9b1d8b2bad000060",
          full_name: "Bob Jones",
          username: "bobjones",
          role: "backend",
          college: "MIT",
          location: "Cambridge, MA",
          bio: "Node.js wizard working on distributed web scrapers and secure APIs.",
          skills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "Python"],
          projects: ["TechScape REST API Core", "Real-time Chat Socket Server"],
          email: "bob@mit.edu",
          avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=bobjones",
          experience_level: "advanced"
        },
        {
          _id: "60c72b2f9b1d8b2bad000070",
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
          experience_level: "beginner"
        }
      ];

      candidates = mockDevs.filter(d => !team.members.includes(d._id));
    } else {
      // Online MongoDB Flow
      team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Fetch all developers who are not already in this team
      candidates = await User.find({
        _id: { $nin: team.members }
      });
    }

    // Run matching algorithm
    const recommendations = candidates.map(dev => {
      const matchResult = calculateMatch(team, dev);
      
      return {
        userId: dev._id.toString(),
        username: dev.username,
        fullName: dev.full_name,
        role: dev.role,
        avatarUrl: dev.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${dev.username}`,
        matchedSkills: matchResult.matchedSkills,
        matchScore: matchResult.matchScore,
        recommendationReason: matchResult.recommendationReason
      };
    });

    // Sort by matchScore descending
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json(recommendations);
  } catch (error) {
    console.error("AI recommendations error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
