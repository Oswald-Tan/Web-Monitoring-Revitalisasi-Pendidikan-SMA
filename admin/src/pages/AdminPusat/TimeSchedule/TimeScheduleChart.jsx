import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
  Cell,
} from "recharts";
import axios from "axios";
import { API_URL } from "../../../config";
import { Download, RefreshCw } from "lucide-react";

const TimeScheduleChart = ({ schoolId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("chart");
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [error, setError] = useState(null);

  const fetchSchoolInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/schools/${schoolId}`);
      setSchoolInfo(response.data.data);

    } catch (error) {
      console.error("Error fetching school info:", error);
      setError("Gagal memuat informasi sekolah");
    }
  };

  const fetchTimeSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/time-schedules/${schoolId}`);
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching time schedule:", error);
      setError("Gagal memuat data time schedule");
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSchedule = async () => {
    // Check if school has valid dates first
    if (!schoolInfo.startDate || !schoolInfo.finishDate) {
      setError(
        "Tidak dapat generate time schedule: tanggal mulai dan selesai belum ditentukan"
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_URL}/time-schedules/generate/${schoolId}`);
      await fetchTimeSchedule();
    } catch (error) {
      console.error("Error generating time schedule:", error);
      setError("Gagal generate time schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId) {
      fetchSchoolInfo();
      fetchTimeSchedule();
    }
  }, [schoolId]);

  const formatMonthYear = (month, year) => {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    });
  };

  const formatDateSafe = (dateString) => {
  if (!dateString) return "Belum ditentukan";

  try {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Belum ditentukan"
      : date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  } catch (error) {
    console.error("Error parsing date:", error);
    return "Belum ditentukan";
  }
};

  const chartData = data.map((item) => ({
    period: formatMonthYear(item.month, item.year),
    month: item.month,
    year: item.year,
    Rencana: item.plannedProgress,
    Realisasi: item.actualProgress,
    Variance: item.variance,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-300 rounded shadow-md">
          <p className="font-bold">{label}</p>
          <p className="text-blue-600">
            Rencana: {payload[0].value.toFixed(2)}%
          </p>
          <p className="text-green-600">
            Realisasi: {payload[1].value.toFixed(2)}%
          </p>
          {payload[2] && (
            <p
              className={
                payload[2].value >= 0 ? "text-green-600" : "text-red-600"
              }
            >
              Variance: {payload[2].value.toFixed(2)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="p-8 text-center">Memuat data time schedule...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Kurva S - Time Schedule</h2>
          {schoolInfo && (
            <p className="text-sm text-gray-600">
              Periode: {formatDateSafe(schoolInfo.startDate)} -{" "}
              {formatDateSafe(schoolInfo.finishDate)}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setView(view === "chart" ? "table" : "chart")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            {view === "chart" ? "Tabel" : "Grafik"}
          </button>
          <button
            onClick={generateTimeSchedule}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
            disabled={
              loading || !schoolInfo?.startDate || !schoolInfo?.finishDate
            }
          >
            <RefreshCw size={16} className="mr-2" />
            Generate Ulang
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {data.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            Data time schedule belum tersedia
          </p>
          <button
            onClick={generateTimeSchedule}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            disabled={!schoolInfo?.startDate || !schoolInfo?.finishDate}
          >
            Generate Time Schedule
          </button>
          {(!schoolInfo?.startDate || !schoolInfo?.finishDate) && (
            <p className="text-red-500 mt-2">
              Tidak dapat generate: pastikan tanggal mulai dan selesai sudah
              ditentukan
            </p>
          )}
        </div>
      ) : view === "chart" ? (
        <div>
          {/* Chart Progress */}
          <div className="h-80 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Rencana"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Realisasi"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Variance */}
          <div className="bg-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              Variance (Realisasi - Rencana)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="period"
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine x={0} stroke="#000" />
                  <Bar dataKey="Variance" name="Variance">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.Variance >= 0 ? "#4caf50" : "#f44336"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Periode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rencana (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Realisasi (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variance (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chartData.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.Rencana.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.Realisasi.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={
                        item.Variance >= 0
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {item.Variance.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.Variance >= 0 ? (
                      <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                        Ahead
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                        Behind
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TimeScheduleChart;
