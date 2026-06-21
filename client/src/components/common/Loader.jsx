// src/components/common/Loader.jsx
import React from "react";

const Loader = ({ fullPage = false }) => {
  return (
    <div
      className={`w-full ${
        fullPage ? "min-h-screen flex items-center justify-center" : ""
      }`}
    >
      <div className="w-full max-w-4xl mx-auto px-4 animate-pulse space-y-6">
        
        {/* Header skeleton */}
        <div className="h-8 bg-slate-200 rounded w-1/3" />

        {/* Card skeleton */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-2/3" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="h-10 bg-slate-200 rounded" />
            <div className="h-10 bg-slate-200 rounded" />
          </div>
        </div>

        {/* List skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="h-4 bg-slate-200 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
};

export default Loader;
