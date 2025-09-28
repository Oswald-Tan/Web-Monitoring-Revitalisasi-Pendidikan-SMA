import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import Swal from "sweetalert2";

const Layout = () => {
  const [events, setEvents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    eventType: "other",
    location: "",
    schoolId: "",
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchCalendarEvents();
  }, [currentDate]);

  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${API_URL}/schools/names`);
      if (Array.isArray(response.data)) {
        setSchools(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setSchools(response.data.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setSchools([]);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const response = await axios.get(
        `${API_URL}/calendar-events?month=${month}&year=${year}`
      );

      setEvents(response.data.data || []);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      Swal.fire("Error", "Gagal memuat data kalender", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/calendar-events`, formData);
      setShowModal(false);
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        eventType: "other",
        location: "",
        schoolId: "",
      });
      fetchCalendarEvents();
      Swal.fire("Sukses", "Kegiatan berhasil ditambahkan", "success");
    } catch (error) {
      console.error("Error creating event:", error);
      Swal.fire("Error", "Gagal menambahkan kegiatan", "error");
    }
  };

  const getEventsForDay = (day) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toDateString();

    return events.filter(
      (event) => new Date(event.startDate).toDateString() === dateStr
    );
  };

  const getEventColor = (type) => {
    switch (type) {
      case "site_visit":
        return "bg-blue-100 text-blue-800";
      case "meeting":
        return "bg-green-100 text-green-800";
      case "qc_check":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const dayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  // Get current month and year
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  // Get first day of month (0-6, where 0=Sunday, 1=Monday, etc.)
  const firstDayOfMonth = new Date(year, month, 1);
  // Adjust for Monday-first week: if Sunday (0), make it 6 (last day of previous week)
  const firstDay = (firstDayOfMonth.getDay() + 6) % 7;
  
  // Get number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Generate calendar days array
  const calendarDays = [];
  // Add empty days from previous month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  // Add days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Kalender Kegiatan
            </h2>
            <p className="text-sm text-gray-600">
              Pantau dan kelola semua kegiatan penting di satu tempat.
            </p>
          </div>
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          onClick={() => setShowModal(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kegiatan</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {monthNames[month]} {year}
          </h3>
          <div className="flex space-x-2">
            <button
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 px-3"
              onClick={handleToday}
            >
              Hari Ini
            </button>
            <button
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              onClick={handleNextMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayLabels.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const isToday = 
                  day === new Date().getDate() &&
                  month === new Date().getMonth() &&
                  year === new Date().getFullYear();
                
                return (
                  <div
                    key={index}
                    className={`border border-gray-300 rounded-lg p-2 min-h-24 ${
                      isToday
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white"
                    }`}
                  >
                    {day && (
                      <>
                        <div
                          className={`text-right text-sm ${
                            isToday
                              ? "font-bold text-blue-600"
                              : "text-gray-700"
                          }`}
                        >
                          {day}
                        </div>
                        {getEventsForDay(day).map((event) => (
                          <div
                            key={event.id}
                            className={`mt-1 text-xs p-1 rounded ${getEventColor(
                              event.eventType
                            )}`}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-gray-600">
                              {new Date(event.startDate).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Kegiatan Mendatang</h3>
          <div className="space-y-3">
            {events
              .filter((event) => new Date(event.startDate) >= new Date())
              .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
              .slice(0, 5)
              .map((event) => (
                <div
                  key={event.id}
                  className="p-3 border rounded-lg flex items-start"
                >
                  <div
                    className={`p-2 rounded-lg mr-3 ${getEventColor(
                      event.eventType
                    )}`}
                  >
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(event.startDate).toLocaleDateString("id-ID", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} |{" "}
                      {new Date(event.startDate).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {event.School && (
                      <p className="text-sm text-gray-500">
                        {event.School.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Improved Modal Tambah Kegiatan */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop with opacity */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowModal(false)}
          />

          
          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 scale-100">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Tambah Kegiatan Baru
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Judul Kegiatan *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Masukkan judul kegiatan"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Mulai *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData({ ...formData, startDate: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Selesai *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Kegiatan
                    </label>
                    <select
                      value={formData.eventType}
                      onChange={(e) =>
                        setFormData({ ...formData, eventType: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    >
                      <option value="site_visit">Kunjungan Lapangan</option>
                      <option value="meeting">Rapat</option>
                      <option value="qc_check">QC Check</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sekolah
                    </label>
                    <select
                      value={formData.schoolId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          schoolId: e.target.value || null,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    >
                      <option value="">Pilih sekolah...</option>
                      {schools.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lokasi
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Masukkan lokasi kegiatan"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      rows="3"
                      placeholder="Masukkan deskripsi kegiatan..."
                    />
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {loading ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;