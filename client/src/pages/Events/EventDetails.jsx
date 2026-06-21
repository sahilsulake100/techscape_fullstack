import React from "react";
import { useParams } from "react-router-dom";

const EventDetails = () => {
  const { id } = useParams();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Event Details for ID: {id}
      </h1>

      <p className="text-gray-600">
        This page will show the full event description, watchlist button, and team links.
      </p>
    </div>
  );
};

export default EventDetails;
