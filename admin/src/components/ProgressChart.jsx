import React from 'react';
import { TrendingUp } from 'lucide-react';

const ProgressChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Progress Keseluruhan</h3>
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 mx-auto mb-2" />
          <p>Grafik Progress akan ditampilkan di sini</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;