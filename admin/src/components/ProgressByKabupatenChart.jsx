import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const ProgressByKabupatenChart = ({ data }) => {
  // Warna untuk status
  const getStatusColor = (kabupatenData) => {
    if (kabupatenData.statusCount.delayed > 0) return '#EF4444'; // Red for delayed
    if (kabupatenData.statusCount.warning > 0) return '#F59E0B'; // Yellow for warning
    return '#10B981'; // Green for on track
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const kabupatenData = payload[0].payload;
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow-md">
          <p className="font-bold text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">
            Rata-rata Progress: <strong>{kabupatenData.averageProgress}%</strong>
          </p>
          <p className="text-sm text-gray-600">
            Jumlah Sekolah: <strong>{kabupatenData.totalSekolah}</strong>
          </p>
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700">Status:</p>
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">
                  On Track: {kabupatenData.statusCount['on-track']}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-600">
                  Warning: {kabupatenData.statusCount.warning}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">
                  Delayed: {kabupatenData.statusCount.delayed}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Progress Sekolah per Kabupaten
      </h2>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 70,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="kabupaten" 
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={[0, 100]}
            label={{ 
              value: 'Progress (%)', 
              angle: -90, 
              position: 'insideLeft',
              offset: -10,
              style: { textAnchor: 'middle' } 
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="averageProgress" 
            name="Rata-rata Progress"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getStatusColor(entry)} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressByKabupatenChart;