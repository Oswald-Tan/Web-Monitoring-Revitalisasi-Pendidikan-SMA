import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import { Download, Calendar, Plus, Search, Edit, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { MdDelete, MdKeyboardArrowDown } from "react-icons/md";
import { FaFilePdf } from "react-icons/fa";
import ButtonAction from "../../../components/ui/ButtonAction";

const Layout = () => {
  const [reports, setReports] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchSchools();
    fetchFinalReports();
  }, [pagination.page]);

  const fetchSchools = async () => {
    try {
      const res = await axios.get(`${API_URL}/schools`);
      setSchools(res.data.data || res.data);
    } catch (error) {
      console.error("Error fetching schools:", error);
      Swal.fire("Error", "Gagal mengambil data sekolah", "error");
    }
  };

  const fetchFinalReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/final-reports?page=${pagination.page}&limit=${pagination.limit}`
      );
      setReports(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching final reports:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data laporan",
        text:
          error.response?.data?.error ||
          "Terjadi kesalahan saat memuat data laporan",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!selectedSchool || !periodStart || !periodEnd) {
      Swal.fire(
        "Peringatan",
        "Pilih sekolah dan periode terlebih dahulu",
        "warning"
      );
      return;
    }

    setGenerating(true);
    try {
      const response = await axios.post(`${API_URL}/final-reports/generate`, {
        schoolId: selectedSchool,
        periodStart,
        periodEnd,
        executiveSummary,
      });

      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Berhasil digenerate",
          text: "Laporan akhir berhasil digenerate",
          showConfirmButton: false,
          timer: 1500,
        });
        setShowGenerateForm(false);
        fetchFinalReports();
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal generate laporan",
        text:
          error.response?.data?.error ||
          "Terjadi kesalahan saat generate laporan",
      });
    } finally {
      setGenerating(false);
    }
  };

  const deleteReport = async (id) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Laporan akhir yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/final-reports/${id}`);
          Swal.fire("Terhapus!", "Laporan akhir telah dihapus.", "success");
          fetchFinalReports();
        } catch (error) {
          console.error("Error deleting report:", error);
          Swal.fire("Error", "Gagal menghapus laporan", "error");
        }
      }
    });
  };

  const downloadPDF = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/final-reports/${id}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Get report name for filename
      const report = reports.find((r) => r.id === id);
      if (report) {
        link.download = `laporan-akhir-${report.School.name}-${
          new Date(report.periodStart).toISOString().split("T")[0]
        }.pdf`;
      } else {
        link.download = `laporan-akhir-${id}.pdf`;
      }

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      Swal.fire("Error", "Gagal mengunduh PDF", "error");
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800", text: "Draft" },
      submitted: { color: "bg-blue-100 text-blue-800", text: "Terkirim" },
      approved: { color: "bg-green-100 text-green-800", text: "Disetujui" },
      published: {
        color: "bg-purple-100 text-purple-800",
        text: "Dipublikasi",
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return `<span class="px-2 py-1 rounded-full text-xs ${config.color}">${config.text}</span>`;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Laporan Akhir
          </h2>
          <p className="text-sm text-gray-600">
            Kelola laporan akhir revitalisasi satuan pendidikan
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowGenerateForm(!showGenerateForm)}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Generate Laporan
          </button>
        </div>
      </div>

      {/* Generate Form */}
      {showGenerateForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Generate Laporan Akhir</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Sekolah
              </label>
              <div className="relative">
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
                >
                  <option value="">Pilih Sekolah</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
                <MdKeyboardArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Periode Mulai
                </label>
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Periode Akhir
                </label>
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ringkasan Eksekutif (Opsional)
            </label>
            <textarea
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan ringkasan eksekutif untuk laporan ini..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowGenerateForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              onClick={generateReport}
              disabled={generating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Laporan"}
            </button>
          </div>
        </div>
      )}

      {/* Reports Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Daftar Laporan Akhir</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari laporan..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <p>Memuat data laporan...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Tidak ada laporan akhir</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                    Sekolah
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                    Periode
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                    Dibuat Oleh
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                    Tanggal Dibuat
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-900">
                        {report.School.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {report.School.kabupaten}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {formatDate(report.periodStart)} -{" "}
                      {formatDate(report.periodEnd)}
                    </td>
                    <td className="py-4 px-6">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: getStatusBadge(report.status),
                        }}
                      />
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {report.generator?.name || "-"}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <ButtonAction
                          onClick={() => downloadPDF(report.id)}
                          icon={<FaFilePdf />}
                          className={"bg-blue-500 hover:bg-blue-600"}
                          tooltip="Lihat"
                        >
                        </ButtonAction>
                        <ButtonAction
                          onClick={() => deleteReport(report.id)}
                          icon={<MdDelete />}
                          className={"bg-red-500 hover:bg-red-600"}
                          tooltip="Hapus Laporan"
                        >
                        </ButtonAction>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-700">
              Menampilkan {(pagination.page - 1) * pagination.limit + 1} hingga{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              dari {pagination.total} entri
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page - 1 })
                }
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
