const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    full_name: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["frontend", "backend", "fullstack", "designer", "ml", "iot"],
      default: "frontend",
    },
    experience_level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    college: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    projects: {
      type: [String],
      default: [],
    },
    linkedin: {
      type: String,
      default: "",
    },
    instagram: {
      type: String,
      default: "",
    },
    avatar_url: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
