// components/ui/Progress.jsx
import React from 'react';

const ProgressAS = ({ value = 0, className = '', ...props }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 ${className}`} {...props}>
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

export { ProgressAS };