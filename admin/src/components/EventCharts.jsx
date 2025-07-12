import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { API_URL } from "../config";
import { useMediaQuery } from "react-responsive";

// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const EventCharts = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Deteksi mode mobile
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/event/stats`);
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="text-center py-10 dark:text-white">Loading charts...</div>
    );

  if (error)
    return (
      <div className="text-center py-10 text-red-500 dark:text-red-400">
        Error: {error}
      </div>
    );

  if (!stats || !stats.statusStats)
    return (
      <div className="text-center py-10 dark:text-white">No data available</div>
    );

  // Format data untuk chart status event
  //   const statusData = [
  //     { name: 'Upcoming', value: stats.statusStats.upcoming },
  //     { name: 'Ongoing', value: stats.statusStats.ongoing },
  //     { name: 'Completed', value: stats.statusStats.completed },
  //   ];

  // Format data untuk chart bulanan
  const monthlyData = stats.monthlyStats.map((item) => {
    const [month, year] = item.month.split("/").map(Number);
    const date = new Date(year, month - 1, 1);

    return {
      name: date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      }),
      Event: item.Event || 0,
      Meeting: item.Meeting || 0,
      Workshop: item.Workshop || 0,
    };
  });

  // Warna untuk setiap tipe event
  const eventColors = {
    Event: "#6366f1",
    Meeting: "#10b981",
    Workshop: "#f59e0b",
  };

  // Format data untuk chart kehadiran global
  //   const attendanceData = stats.attendanceStats.map((item) => ({
  //     name:
  //       item.status === "hadir"
  //         ? "Attended"
  //         : item.status === "tidak_hadir"
  //         ? "Absent"
  //         : item.status === "izin"
  //         ? "Permission"
  //         : "Pending",
  //     value: item.count,
  //   }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 w-full">
      {/* Pie Chart: Status Event */}
      {/* <div className="bg-white dark:bg-[#282828] p-4 rounded-3xl">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Event Status Distribution</h3>
        <ResponsiveContainer width="100%" height={isMobile ? 300 : 350}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false} // Menghilangkan label di dalam pie
              outerRadius={isMobile ? 100 : 130}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} events`, name]}
              labelFormatter={(name) => `Status: ${name}`}
              contentStyle={{ 
                fontSize: isMobile ? 12 : 14,
                color: '#333',
                borderRadius: '8px',
                border: 'none'
              }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconSize={isMobile ? 10 : 12}
              wrapperStyle={{ 
                paddingTop: '15px', 
                paddingBottom: '5px',
                fontSize: isMobile ? 12 : 14
              }}
              formatter={(value, entry, index) => (
                <span className="text-gray-700 dark:text-white text-sm">
                  {value} ({((statusData[index].value / statusData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div> */}

      {/* Bar Chart: Monthly Events by Type */}
      <div className="bg-white dark:bg-[#282828] p-4 rounded-3xl">
        <h3 className="text-xl text-center font-semibold mb-4 dark:text-white">
          Events per Month by Type
        </h3>
        <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
          <BarChart
            data={monthlyData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e0e0e0"
              strokeOpacity={0.3}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: isMobile ? 10 : 12, fill: "#666" }}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 60 : 40}
            />
            <YAxis
              tick={{ fontSize: isMobile ? 10 : 12, fill: "#666" }}
              label={{
                value: "Number of Events",
                angle: -90,
                position: "insideLeft",
                offset: -10,
                style: { textAnchor: "middle", fill: "#666" },
              }}
            />
            <Tooltip
              contentStyle={{
                fontSize: isMobile ? 12 : 14,
                backgroundColor: "#fff",
                color: "#333",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value, name) => [`${value} events`, name]}
              labelFormatter={(label) => `Month: ${label}`}
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
            />
            <Legend
              layout={isMobile ? "horizontal" : "horizontal"}
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                paddingTop: "20px",
                paddingBottom: "10px",
                fontSize: isMobile ? 12 : 14,
              }}
              formatter={(value) => (
                <span className="text-gray-700 dark:text-white text-sm">
                  {value}
                </span>
              )}
            />
            <Bar
              dataKey="Event"
              fill={eventColors.Event}
              name="Event"
              radius={[4, 4, 0, 0]}
              barSize={isMobile ? 20 : 30}
            />
            <Bar
              dataKey="Meeting"
              fill={eventColors.Meeting}
              name="Meeting"
              radius={[4, 4, 0, 0]}
              barSize={isMobile ? 20 : 30}
            />
            <Bar
              dataKey="Workshop"
              fill={eventColors.Workshop}
              name="Workshop"
              radius={[4, 4, 0, 0]}
              barSize={isMobile ? 20 : 30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart: Global Attendance */}
      {/* <div className="bg-white dark:bg-[#282828] p-4 rounded-3xl">
        <h3 className="text-xl text-center font-semibold mb-4 dark:text-white">
          Global Attendance Status
        </h3>
        <div className="w-full" style={{ height: isMobile ? 300 : 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={attendanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false} // Menghilangkan label di dalam pie
                outerRadius={isMobile ? 100 : 130}
                dataKey="value"
              >
                {attendanceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} participants`, name]}
                labelFormatter={(name) => `Status: ${name}`}
                contentStyle={{
                  fontSize: isMobile ? 12 : 14,
                  color: "#333",
                  borderRadius: "8px",
                  border: "none",
                }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconSize={isMobile ? 10 : 12}
                wrapperStyle={{
                  paddingTop: "15px",
                  paddingBottom: "5px",
                  fontSize: isMobile ? 12 : 14,
                }}
                formatter={(value, entry, index) => {
                  const total = attendanceData.reduce((a, b) => a + b.value, 0);
                  const percent =
                    total > 0
                      ? ((attendanceData[index].value / total) * 100).toFixed(0)
                      : 0;
                  return (
                    <span className="text-gray-700 dark:text-white text-sm">
                      {attendanceData[index]?.name} ({percent}%)
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div> */}
    </div>
  );
};

export default EventCharts;
