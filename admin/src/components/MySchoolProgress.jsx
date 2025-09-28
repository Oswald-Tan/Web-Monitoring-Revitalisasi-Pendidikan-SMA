import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { CardAS, CardContentAS, CardHeaderAS, CardTitleAS } from '../components/ui/CardAS';
import { ProgressAS } from '../components/ui/ProgressAS';
import { API_URL } from '../config';

const MySchoolProgress = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/dashboard/my-school-progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!data) return <div className="p-4">Data tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <CardAS>
        <CardHeaderAS>
          <CardTitleAS>Progress Sekolah - {data.school.name}</CardTitleAS>
        </CardHeaderAS>
        <CardContentAS>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Progress Terkini</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Progress: {data.school.currentProgress}%</span>
                  <span className="capitalize">Status: {data.school.status}</span>
                </div>
                <ProgressAS value={data.school.currentProgress} className="w-full" />
                <div className="text-sm text-gray-500">
                  Timeline: {new Date(data.school.timeline.start).toLocaleDateString('id-ID')} -{' '}
                  {new Date(data.school.timeline.finish).toLocaleDateString('id-ID')}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Grafik Progress Bulanan</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Progress']}
                    labelFormatter={(value) => `Bulan: ${value}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="progress" 
                    stroke="#3b82f6" 
                    name="Progress (%)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContentAS>
      </CardAS>

      <CardAS>
        <CardHeaderAS>
          <CardTitleAS>Detail Progress Bulanan</CardTitleAS>
        </CardHeaderAS>
        <CardContentAS>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bulan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.chartData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.progress}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.progress >= 80 ? 'bg-green-100 text-green-800' :
                        item.progress >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.progress >= 80 ? 'Baik' : item.progress >= 50 ? 'Sedang' : 'Perlu Perhatian'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContentAS>
      </CardAS>

      <CardAS>
        <CardHeaderAS>
          <CardTitleAS>Detail Informasi</CardTitleAS>
        </CardHeaderAS>
        <CardContentAS>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold">Progress Terkini</h4>
              <p className="text-2xl font-bold">{data.school.currentProgress}%</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold">Status Proyek</h4>
              <p className="text-2xl font-bold capitalize">{data.school.status}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold">Hari Tersisa</h4>
              <p className="text-2xl font-bold">
                {Math.max(0, Math.ceil((new Date(data.school.timeline.finish) - new Date()) / (1000 * 60 * 60 * 24)))} hari
              </p>
            </div>
          </div>
        </CardContentAS>
      </CardAS>
    </div>
  );
};

export default MySchoolProgress;