import React from "react";

// Simple progress bar component to avoid inline styles
interface ProgressBarProps {
  progress: number;
  className?: string;
  color?: "green" | "blue" | "yellow" | "red";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = "",
  color = "green",
}) => {
  const getColorClass = () => {
    switch (color) {
      case "blue":
        return "bg-blue-500";
      case "yellow":
        return "bg-yellow-500";
      case "red":
        return "bg-red-500";
      default:
        return "bg-green-500";
    }
  };
  // Use exact progress value, clamped to 0-100
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));
  const widthClass = `w-progress-${clampedProgress}`;

  return (
    <div
      className={`h-3 rounded-full transition-all duration-300 ${getColorClass()} ${widthClass} ${className}`}
    />
  );
};
