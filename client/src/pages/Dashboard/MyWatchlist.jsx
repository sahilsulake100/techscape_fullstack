import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const MyWatchlist = () => {
  return (
    // This page is rendered inside the DashboardLayout
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">⭐ My Event Watchlist</h1>
      <p className="text-gray-600 mb-8">
        Here you can view all the events you've saved. You can also view event updates and reminders here.
      </p>
      
      {/* Watchlist content will be rendered here */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 min-h-[300px]">
        {/* Logic to fetch and display watchlist events will go here */}
        <p className="text-center text-gray-400 mt-20">No events saved yet.</p>
      </div>

    </div>
  );
};

export default MyWatchlist; // <-- CRITICAL FIX