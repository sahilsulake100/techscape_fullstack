import React from "react";
import { cn } from "../../firebase/utils";

// Rename the component to CustomButton to match the Home.jsx import
const CustomButton = ({ 
  children, 
  variant = "default", 
  size = "default", 
  className, 
  ...props 
}) => {
  const base =
    "inline-flex items-center justify-center rounded-lg font-semibold transition-all";

  const variants = {
    default:
      "bg-primary text-white px-4 py-2 hover:bg-primary/90 shadow-glow",
    outline:
      "border-2 border-primary text-primary bg-white hover:bg-primary hover:text-white",
    ghost: "text-primary hover:bg-primary/10",
    vibrant:
      "px-6 py-3 bg-gradient-vibrant text-white rounded-xl hover:shadow-neon hover:scale-105", 
  };

  const sizes = {
    default: "h-10 px-4",
    sm: "h-8 px-3 text-sm",
    lg: "h-12 px-6 text-lg",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

// CRITICAL FIX: Export it as CustomButton to match the Home.jsx import
export { CustomButton };