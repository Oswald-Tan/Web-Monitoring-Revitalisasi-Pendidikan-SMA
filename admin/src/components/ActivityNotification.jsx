import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const ActivityNotification = ({ 
  title, 
  description, 
  type = 'warning' 
}) => {
  const typeClasses = {
    warning: 'bg-yellow-50 text-yellow-600',
    success: 'bg-green-50 text-green-600'
  };
  
  const Icon = type === 'warning' ? AlertTriangle : CheckCircle;

  return (
    <div className={`flex items-start space-x-3 p-3 rounded-lg ${typeClasses[type]}`}>
      <Icon className="w-5 h-5 mt-0.5" />
      <div>
        <p className="font-medium text-gray-800">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default ActivityNotification;