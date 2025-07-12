import React from 'react';

const StatCard = ({ title, value, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
        </div>
        {React.cloneElement(icon, { className: `w-8 h-8 ${colorClasses[color]}` })}
      </div>
    </div>
  );
};

export default StatCard;