const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    skills_needed: {
      type: [String],
      default: [],
    },
    open_roles: {
      type: [String],
      default: [],
    },
    max_members: {
      type: Number,
      default: 5,
    },
    leader_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leader_name: {
      type: String,
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", TeamSchema);
