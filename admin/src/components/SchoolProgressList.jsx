import React from 'react';

const SchoolProgressList = ({ schools }) => {
  const getStatusColor = (status) => {
    const colors = {
      'on-track': 'bg-blue-100 text-blue-800',
      'delayed': 'bg-red-100 text-red-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Sekolah dengan Progress Tertinggi
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sekolah
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kabupaten
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-gray-200">
            {schools.map((school) => (
              <tr key={school.id}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {school.name}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {school.kabupaten}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${school.progress}%` }}
                      ></div>
                    </div>
                    <span>{school.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(school.status)}`}>
                    {school.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchoolProgressList;