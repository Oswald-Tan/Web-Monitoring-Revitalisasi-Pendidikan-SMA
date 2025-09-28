import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Mail,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Reply,
  CheckCircle,
  Clock,
  Loader,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { API_URL } from "../../../config";
import { MdKeyboardArrowDown, MdSearch } from "react-icons/md";

const Layout = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Fetch messages
  const fetchMessages = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/contact/messages`, {
        params: {
          page: page,
          limit: itemsPerPage,
        },
      });

      if (response.data.success) {
        setMessages(response.data.data);
        setTotalMessages(response.data.pagination.total);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Gagal memuat data pesan");
    } finally {
      setLoading(false);
    }
  };

  // Update message status
  const updateStatus = async (messageId, newStatus) => {
    try {
      setUpdatingStatus(messageId);

      const response = await axios.patch(
        `${API_URL}/contact/messages/${messageId}/status`,
        { status: newStatus }
      );

      if (response.data.success) {
        // Update local state
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, status: newStatus } : msg
          )
        );

        // Update selected message if it's the one being viewed
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Gagal memperbarui status pesan");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Filter messages based on search and filter
  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || message.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        label: "Pending",
      },
      read: { color: "bg-blue-100 text-blue-800", icon: Eye, label: "Dibaca" },
      replied: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Dibalas",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pagination controls

  useEffect(() => {
    fetchMessages(1);
  }, []);

  if (loading && messages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Memuat pesan...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Pesan Kontak
              </h2>
              <p className="text-sm text-gray-600">
                Kelola pesan yang masuk dari form kontak
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchMessages(currentPage)}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Pesan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalMessages}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {messages.filter((m) => m.status === "pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Dibaca</p>
                <p className="text-2xl font-bold text-gray-900">
                  {messages.filter((m) => m.status === "read").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Dibalas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {messages.filter((m) => m.status === "replied").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 group-hover:shadow-md"
                  placeholder="Cari berdasarkan nama, email, atau pesan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <MdSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            <div className="relative">
              <select
                className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="read">Dibaca</option>
                <option value="replied">Dibalas</option>
              </select>
              <MdKeyboardArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Messages Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "Tidak ada pesan yang sesuai dengan filter"
                  : "Belum ada pesan yang masuk"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto relative">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                      Pengirim
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                      Pesan
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                      Tanggal
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMessages.map((message) => (
                    <tr key={message.id} className="text-sm hover:bg-gray-50 transition-colors duration-150 group">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          <div className="font-medium text-gray-900">
                            {message.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {message.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          <p className="text-sm text-gray-900 line-clamp-2">
                            {message.message}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-500">
                        {formatDate(message.createdAt)}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <StatusBadge status={message.status} />
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedMessage(message)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <div className="relative">
                            <select
                              value={message.status}
                              onChange={(e) =>
                                updateStatus(message.id, e.target.value)
                              }
                              disabled={updatingStatus === message.id}
                              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="read">Dibaca</option>
                              <option value="replied">Dibalas</option>
                            </select>
                            {updatingStatus === message.id && (
                              <Loader className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 animate-spin" />
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Detail Pesan</h3>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pengirim
                    </label>
                    <p className="text-gray-900">{selectedMessage.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{selectedMessage.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal
                    </label>
                    <p className="text-gray-900">
                      {formatDate(selectedMessage.created_at)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={selectedMessage.status} />
                      <select
                        value={selectedMessage.status}
                        onChange={(e) =>
                          updateStatus(selectedMessage.id, e.target.value)
                        }
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="read">Dibaca</option>
                        <option value="replied">Dibalas</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pesan
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>

                  {selectedMessage.ip_address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Informasi Teknis
                      </label>
                      <div className="text-sm text-gray-600">
                        <p>IP Address: {selectedMessage.ip_address}</p>
                        {selectedMessage.user_agent && (
                          <p className="mt-1">
                            User Agent: {selectedMessage.user_agent}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Tutup
                    </button>
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Balasan: Pesan Kontak Revitalisasi SMA`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Balas via Email
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
