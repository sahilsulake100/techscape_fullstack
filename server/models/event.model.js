const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    event_type: {
      type: String,
      enum: ["hackathon", "coding_contest", "workshop", "conference", "meetup"],
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      default: "Online / Remote",
    },
    is_virtual: {
      type: Boolean,
      default: false,
    },
    registration_url: {
      type: String,
      default: "",
    },
    max_participants: {
      type: Number,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    image_url: {
      type: String,
      default: "",
    },
    organizer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    watchlisted_by: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
