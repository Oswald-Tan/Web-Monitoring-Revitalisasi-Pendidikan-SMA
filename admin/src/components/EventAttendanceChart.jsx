import { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { API_URL } from '../config';

const COLORS = ['#00C49F', '#FF8042', '#0088FE'];

const EventAttendanceChart = ({ eventId }) => {
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceStats = async () => {
      if (!eventId) return;
      
      try {
        const response = await axios.get(`/${API_URL}/event/${eventId}/attendance-stats`);
        setAttendanceStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching attendance stats:', error);
        setLoading(false);
      }
    };

    fetchAttendanceStats();
  }, [eventId]);

  // Format data untuk chart
  const chartData = attendanceStats.map(stat => ({
    name: stat.status === 'hadir' ? 'Attended' : 
          stat.status === 'tidak_hadir' ? 'Absent' : 'Pending',
    value: stat.count
  }));

  if (loading) return <div className="text-center py-4">Loading attendance data...</div>;
  if (!chartData.length) return <div className="text-center py-4">No attendance data</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">Attendance Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} participants`, '']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EventAttendanceChart;