import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { API_URL } from "../config";
import { useMediaQuery } from "react-responsive";

const PieChartProdi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Deteksi mode mobile
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/mahasiswa/per-prodi`);
        setData(response.data);
      } catch (err) {
        setError("Gagal memuat data: " + err.message);
        console.error("API Error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#FF8042",
    "#8884D8",
    "#82ca9d",
  ];

  // Hitung total untuk persentase
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (loading) return <div className="text-center py-10 dark:text-white">Memuat data...</div>;
  if (error)
    return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="bg-white dark:bg-[#282828] p-4 rounded-3xl w-full">
      <h2 className="text-xl font-semibold mb-4 text-center dark:text-white">
        Distribusi Mahasiswa per Program Studi
      </h2>

      {data.length === 0 ? (
        <p className="text-center dark:text-white">Tidak ada data mahasiswa</p>
      ) : (
        <div className="flex flex-col items-center">
          {/* Chart Area */}
          <div className="w-full" style={{ height: isMobile ? 300 : 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false} // Hilangkan label di dalam chart
                  outerRadius={isMobile ? 100 : 130}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} mahasiswa`, "Jumlah"]}
                  labelFormatter={(name) => `Prodi: ${name}`}
                  contentStyle={{ 
                    fontSize: isMobile ? 12 : 14,
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    color: '#333',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                {/* Legend untuk desktop */}
                {!isMobile && (
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconSize={10}
                    wrapperStyle={{
                      paddingTop: "15px",
                      paddingBottom: "5px",
                      fontSize: 12, // Ukuran font legend
                    }}
                    formatter={(value, entry, index) => {
                      const percent = total > 0 
                        ? ((data[index]?.value / total) * 100).toFixed(1) 
                        : '0.0';
                      return (
                        <span className="text-gray-700 text-sm dark:text-white">
                          {data[index]?.name} ({percent}%)
                        </span>
                      );
                    }}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend untuk Mobile */}
          {isMobile && data.length > 0 && (
            <div className="mt-4 w-full">
              <div className="flex flex-wrap justify-center gap-2">
                {data.map((entry, index) => {
                  const percent = total > 0 
                    ? ((entry.value / total) * 100).toFixed(1) 
                    : '0.0';
                  
                  return (
                    <div
                      key={`mobile-legend-${index}`}
                      className="flex items-center bg-gray-100 dark:bg-[#3f3f3f] px-3 py-1.5 rounded-full"
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-xs text-gray-700 dark:text-white">
                        {entry.name} <span className="font-medium">({percent}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PieChartProdi;