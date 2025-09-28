import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import TimeScheduleChart from "../TimeSchedule/TimeScheduleChart";
import ProgressByKabupatenChart from "../../../components/ProgressByKabupatenChart";
import DashboardStats from "../../../components/DashboardStats";
import SchoolProgressList from "../../../components/SchoolProgressList";

const Layout = () => {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [kabupatenData, setKabupatenData] = useState([]);
  const [stats, setStats] = useState({
    totalSchools: 0,
    onTrackSchools: 0,
    completedSchools: 0,
    delayedSchools: 0,
  });
  const [topSchools, setTopSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchools();
    fetchDashboardStats();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${API_URL}/schools`);
      setSchools(response.data.data || response.data);
      if (response.data.data && response.data.data.length > 0) {
        setSelectedSchool(response.data.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/dashboard/stats`);

      if (response.data.success) {
        setStats(response.data.data.stats);
        setKabupatenData(response.data.data.progressByKabupaten);
        setTopSchools(response.data.data.topSchools || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="text-sm text-gray-500">
          Data diperbarui: {new Date().toLocaleDateString("id-ID")}
        </div>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
        <ProgressByKabupatenChart data={kabupatenData} />

        <div className="space-y-6">
          <SchoolProgressList schools={topSchools} />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pilih Sekolah
        </label>
        <select
          value={selectedSchool || ""}
          onChange={(e) => setSelectedSchool(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
        >
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name} - {school.kabupaten}
            </option>
          ))}
        </select>
      </div>

      {selectedSchool && (
        <TimeScheduleChart
          schoolId={selectedSchool}
          schoolName={
            schools.find((s) => s.id === parseInt(selectedSchool))?.name || ""
          }
        />
      )}
    </div>
  );
};

export default Layout;