"use client";

import React from 'react';

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  animated?: boolean;
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, showLabel = true, animated = true, ...props }, ref) => {
    const percentage = (value / max) * 100;

    return (
      <div ref={ref} className={`${className || ''}`} {...props}>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ${
              animated ? 'ease-out' : ''
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">{value}</span>
            <span className="text-gray-400 dark:text-gray-500">{Math.round(percentage)}%</span>
          </div>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';
