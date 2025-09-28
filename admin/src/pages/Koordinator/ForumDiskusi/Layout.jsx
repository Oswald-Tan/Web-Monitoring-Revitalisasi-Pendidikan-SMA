import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import { MessageSquare, Pin, Lock, LockOpen, PinOff } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Layout = () => {
  const [threads, setThreads] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    schoolId: "",
    message: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchThreads();
    fetchSchools();
  }, []);

  const fetchThreads = async () => {
    try {
      const response = await axios.get(`${API_URL}/discussion-threads`);
      setThreads(response.data.data);
    } catch (error) {
      console.error("Error fetching threads:", error);
      Swal.fire("Error", "Gagal memuat thread diskusi", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${API_URL}/schools`);
      setSchools(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/discussion-threads`, formData);

      Swal.fire("Success", "Thread berhasil dibuat", "success");
      setFormData({ title: "", schoolId: "", message: "" });
      fetchThreads();
    } catch (error) {
      console.error("Error creating thread:", error);
      Swal.fire("Error", "Gagal membuat thread", "error");
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} menit yang lalu`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} jam yang lalu`;
    } else {
      return date.toLocaleDateString("id-ID");
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Memuat thread diskusi...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Forum Diskusi</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {threads.map((thread) => (
          <div
            key={thread.id}
            className={`bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
              thread.isPinned ? "border-yellow-400 border-2" : "border-gray-300"
            }`}
            onClick={() => navigate(`/super-admin/discussion/${thread.id}`)}
          >
            <div className="p-4 border-b">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-lg">{thread.title}</h3>
                <div className="flex items-center space-x-1">
                  {thread.isPinned && (
                    <Pin size={16} className="text-yellow-500" />
                  )}
                  {thread.isClosed && (
                    <Lock size={16} className="text-red-500" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {thread.School?.name || "Unknown School"}
              </p>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-600">
                Dibuat oleh: {thread.author?.name || "Unknown"}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Update terakhir: {formatTime(thread.lastUpdate)}
              </p>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">
                  {thread.messageCount} pesan
                </span>
                {thread.lastMessage && (
                  <span className="text-xs text-gray-500">
                    Terbaru: {thread.lastMessage.author?.name}
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50">
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                <span>Buka Diskusi</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {threads.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-300">
          <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">
            Belum ada thread diskusi
          </h3>
          <p className="text-gray-500">
            Jadilah yang pertama membuat thread diskusi
          </p>
        </div>
      )}

      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-300">
        <h3 className="text-lg font-semibold mb-4">Buat Thread Baru</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Thread
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Masukkan judul diskusi"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sekolah
            </label>
            <select
              name="schoolId"
              value={formData.schoolId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih sekolah...</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name} - {school.kabupaten}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesan Awal
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tulis pesan pertama Anda..."
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Buat Thread
          </button>
        </form>
      </div>
    </div>
  );
};

export default Layout;
