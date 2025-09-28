// components/Progress.jsx
import React, { useState, useEffect } from "react";
import { CheckCircle, TrendingUp, Loader } from "lucide-react";
import axios from "axios";
import { API_URL } from "../../../admin/src/config";

const Progress = () => {
  const [progressData, setProgressData] = useState([]);
  const [statusData, setStatusData] = useState({
    status_count: [],
    total_projects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgressData = async () => {
    try {
      setLoading(true);

      // Fetch data progress per kabupaten
      const progressResponse = await axios.get(
        `${API_URL}/schools/progress/kabupaten`
      );
      setProgressData(progressResponse.data);

      // Fetch data status proyek
      const statusResponse = await axios.get(`${API_URL}/schools/status/count`);
      setStatusData(statusResponse.data);
    } catch (err) {
      console.error("Error fetching progress data:", err);
      setError("Gagal memuat data progress");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "on-track":
        return "bg-yellow-500";
      case "delayed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Selesai";
      case "on-track":
        return "Progress";
      case "delayed":
        return "Terlambat";
      default:
        return status;
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-600";
    if (progress >= 60) return "bg-yellow-600";
    return "bg-red-600";
  };

  if (loading) {
    return (
      <section id="progress" className="py-20 bg-white">
        <div className="container mx-auto md:w-10/11 w-11/12">
          <div className="flex justify-center items-center h-64">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Memuat data progress...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="progress" className="py-20 bg-white">
        <div className="container mx-auto md:w-10/11 w-11/12">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={fetchProgressData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="progress" className="py-20 bg-white">
      <div className="container mx-auto md:w-10/11 w-11/12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Progress Real-time
          </h2>
          <p className="text-xl text-gray-600">
            Pantau kemajuan pembangunan secara real-time dengan dashboard
            interaktif
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Progress per Kabupaten */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Progress per Kabupaten
            </h3>
            <div className="space-y-4">
              {progressData.length > 0 ? (
                progressData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-32 text-sm font-medium text-gray-700">
                      {item.kabupaten}
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full ${getProgressColor(
                            item.progress
                          )}`}
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-medium text-gray-700">
                      {item.progress}%
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">
                  Tidak ada data progress
                </p>
              )}
            </div>
          </div>

          {/* Pie Chart Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Status Proyek
            </h3>
            <div className="h-64 flex items-center justify-center">
              {statusData.status_count.length > 0 ? (
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-green-200 to-blue-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-700">
                      {statusData.status_count.find(
                        (s) => s.status === "completed"
                      )?.percentage || 0}
                      %
                    </span>
                  </div>
                  <div className="space-y-2">
                    {statusData.status_count.map((statusItem, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(
                              statusItem.status
                            )}`}
                          ></div>
                          <span className="text-sm">
                            {getStatusLabel(statusItem.status)}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {statusItem.count}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="text-sm font-medium">Total</span>
                      <span className="text-sm font-medium">
                        {statusData.total_projects}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Tidak ada data status</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Progress;
