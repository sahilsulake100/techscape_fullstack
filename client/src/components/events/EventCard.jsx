import React from "react";
import { Link } from "react-router-dom";
import {
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const EventCard = ({ event }) => {
  // Extract event values with safe fallbacks
  const {
    id,
    title = "Untitled Event",
    description = "",
    start_date,
    location = "Online / Remote",
    event_type = "General",
    organizer,
  } = event;

  // Format date
  const formattedDate = start_date
    ? new Date(start_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date TBD";

  // Determine organizer name safely
  const organizerName =
    organizer?.full_name ||
    organizer?.username ||
    organizer?.name ||
    "Unknown Organizer";

  // Trim description safely
  const truncatedDescription =
    description.length > 80
      ? description.substring(0, 80) + "..."
      : description || "No description provided.";

  // Badge colors for event types
  const badgeColor =
    event_type === "Hackathon"
      ? "bg-indigo-100 text-indigo-700"
      : event_type === "Workshop"
      ? "bg-green-100 text-green-700"
      : event_type === "Seminar"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-700";

  return (
    <Link to={`/events/${id}`} className="block">
      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer h-full flex flex-col">

        {/* Event Type Badge */}
        <span
          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 ${badgeColor}`}
        >
          {event_type}
        </span>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
          {title}
        </h3>

        {/* Organizer */}
        <p className="text-sm text-gray-500 mb-4">
          Hosted by:{" "}
          <span className="font-medium text-indigo-600">{organizerName}</span>
        </p>

        {/* Event Details */}
        <div className="space-y-2 text-sm text-gray-700 flex-grow">
          <p className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-2 text-indigo-500" />
            {formattedDate}
          </p>

          <p className="flex items-center">
            <MapPinIcon className="w-4 h-4 mr-2 text-indigo-500" />
            {location}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mt-4 mb-4">
          {truncatedDescription}
        </p>

        {/* CTA */}
        <div className="pt-4 border-t border-gray-100 text-right">
          <span className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            View Details & Register →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
