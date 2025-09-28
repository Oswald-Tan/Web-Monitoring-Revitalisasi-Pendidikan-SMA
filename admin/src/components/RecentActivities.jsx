import React from 'react';

const RecentActivities = ({ activities }) => {
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Aktivitas Terbaru
      </h2>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-800">
                  {activity.schoolName} - {activity.kabupaten}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {activity.keterangan || 'Tidak ada keterangan'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">
                  {formatDate(activity.tanggal)}
                </span>
                <div className="mt-1 text-sm font-medium text-blue-600">
                  +{activity.progress}% progress
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;