import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { API_URL } from "../../../config";
import Swal from "sweetalert2";
import { Eye, Check, X, Download } from "lucide-react";
import { MdSearch, MdKeyboardArrowDown } from "react-icons/md";

const Layout = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [message, setMessage] = useState("");
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [filters, setFilters] = useState({
    statusReview: "",
    schoolId: "",
  });
  const [schools, setSchools] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchSchools();
    fetchReports();
  }, [page, keyword, limit, filters]);

  const changePage = ({ selected }) => {
    setPage(selected);
    setMessage("");
  };

  const searchData = (e) => {
    e.preventDefault();
    setPage(0);
    setMessage("");
    setKeyword(query);
  };

  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    const timeout = setTimeout(() => {
      setKeyword(query);
    }, 300);

    setTypingTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [query]);

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

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/daily-reports/review?search=${keyword}&page=${page}&limit=${limit}`
      );
      setReports(res.data.data);

      if (res.data && res.data.data) {
        setSchools(res.data.data || 0);
        setPages(res.data.totalPages || 0);
        setRows(res.data.totalRows || 0);
        setPage(res.data.page || 0);
      } else {
        console.error("Invalid response structure", res);
      }

      if (res.data.data.length === 0 && page > 0) {
        setPage(0);
      }
    } catch (error) {
      console.error("Error fetching reports for review:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal mengambil data laporan harian",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReportDetail = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/daily-reports/${id}`);
      setSelectedReport(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching report detail:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal mengambil detail laporan",
      });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1); // Reset to first page when filter changes
  };

  const handleReview = async (reportId, status) => {
    try {
      const { value: catatan } = await Swal.fire({
        title: status === "approved" ? "Setujui Laporan?" : "Tolak Laporan?",
        input: "textarea",
        inputLabel: "Catatan Review",
        inputPlaceholder: "Masukkan catatan review...",
        showCancelButton: true,
        confirmButtonText: status === "approved" ? "Setujui" : "Tolak",
        cancelButtonText: "Batal",
        inputValidator: (value) => {
          if (status === "rejected" && !value) {
            return "Harap berikan catatan untuk penolakan!";
          }
        },
      });

      if (catatan !== undefined) {
        await axios.patch(`${API_URL}/daily-reports/${reportId}/review`, {
          statusReview: status,
          catatanReview: catatan,
        });

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: `Laporan berhasil ${
            status === "approved" ? "disetujui" : "ditolak"
          }`,
        });

        fetchReports(); // Refresh data
      }
    } catch (error) {
      console.error("Error reviewing report:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal melakukan review",
      });
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Disetujui";
      case "rejected":
        return "Ditolak";
      default:
        return "Menunggu Review";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Review Laporan Harian
            </h2>
            <p className="text-sm text-gray-600">
              Manage review laporan harian
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <form onSubmit={searchData} className="relative w-full">
            <div className="relative group">
              <input
                type="text"
                className="w-full md:w-64 pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 group-hover:shadow-md"
                placeholder="Search users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <MdSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Limit Selector */}
            <div className="relative flex-1">
              <select
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
                onChange={(e) => setLimit(e.target.value)}
                value={limit}
              >
                <option value="10">Show 10</option>
                <option value="20">Show 20</option>
                <option value="25">Show 25</option>
              </select>
              <MdKeyboardArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative flex-1">
              <select
                name="schoolId"
                value={filters.schoolId}
                onChange={handleFilterChange}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
              >
                <option value="">Semua Sekolah</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
              <MdKeyboardArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative flex-1">
              <select
                name="statusReview"
                value={filters.statusReview}
                onChange={handleFilterChange}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
              >
                <option value="">Semua Status</option>
                <option value="pending">Menunggu Review</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>
              <MdKeyboardArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sekolah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Pekerjaan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status Review
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.School?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(report.tanggal).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="line-clamp-2">
                          {report.RabItem?.uraian}
                        </div>
                        {report.RabItem?.building && (
                          <div className="text-xs text-gray-500">
                            Gedung: {report.RabItem.building}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${report.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {report.progress}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                            report.statusReview
                          )}`}
                        >
                          {getStatusText(report.statusReview)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => fetchReportDetail(report.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Lihat Detail"
                          >
                            <Eye size={20} />
                          </button>
                          {report.statusReview === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleReview(report.id, "approved")
                                }
                                className="text-green-600 hover:text-green-900"
                                title="Setujui"
                              >
                                <Check size={20} />
                              </button>
                              <button
                                onClick={() =>
                                  handleReview(report.id, "rejected")
                                }
                                className="text-red-600 hover:text-red-900"
                                title="Tolak"
                              >
                                <X size={20} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reports.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Tidak ada laporan ditemukan
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Section */}
      {schools.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-medium">
              Showing {page * limit + 1} to {Math.min((page + 1) * limit, rows)}{" "}
              of {rows} daily review
            </span>
            <span className="text-gray-400">•</span>
            <span>
              Page {page + 1} of {pages}
            </span>
          </div>

          {/* Pagination */}
          <nav>
            <ReactPaginate
              previousLabel="← Previous"
              nextLabel="Next →"
              pageCount={Math.min(10, pages)}
              onPageChange={changePage}
              forcePage={page}
              containerClassName="flex items-center gap-1"
              pageLinkClassName="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
              previousLinkClassName="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
              nextLinkClassName="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
              activeLinkClassName="!bg-green-500 !text-white !border-green-500"
              disabledLinkClassName="opacity-50 cursor-not-allowed"
              breakLinkClassName="px-3 py-2 text-sm font-medium text-gray-500"
              pageClassName="hover:bg-gray-50"
              previousClassName="hover:bg-gray-50"
              nextClassName="hover:bg-gray-50"
            />
          </nav>
        </div>
      )}

      {/* Error Message */}
      {message && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm font-medium">
            {message}
          </p>
        </div>
      )}

      {/* Modal Detail Laporan */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  Detail Laporan Harian
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Sekolah
                  </h4>
                  <p className="text-sm text-gray-900">
                    {selectedReport.School?.name}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Tanggal
                  </h4>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedReport.tanggal).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Item Pekerjaan
                  </h4>
                  <p className="text-sm text-gray-900">
                    {selectedReport.RabItem?.uraian}
                  </p>
                  {selectedReport.RabItem?.building && (
                    <p className="text-xs text-gray-500 mt-1">
                      Gedung: {selectedReport.RabItem.building}
                    </p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Progress
                  </h4>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${selectedReport.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900">
                      {selectedReport.progress}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Keterangan
                </h4>
                <p className="text-sm text-gray-900 whitespace-pre-line">
                  {selectedReport.keterangan || "Tidak ada keterangan"}
                </p>
              </div>

              {selectedReport.files && selectedReport.files.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Dokumentasi
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedReport.files.map((file, index) => (
                      <div key={index} className="relative group">
                        {file.includes(".mp4") ||
                        file.includes(".mov") ||
                        file.includes(".avi") ? (
                          <video
                            src={`${API_URL}/uploads/daily-reports/${file}`}
                            className="w-full h-32 object-cover rounded-lg"
                            controls
                          />
                        ) : (
                          <img
                            src={`${API_URL}/uploads/daily-reports/${file}`}
                            alt={`Dokumentasi ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                        <a
                          href={`${API_URL}/uploads/daily-reports/${file}`}
                          download
                          className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.checklist && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Checklist QC
                  </h4>
                  <div className="space-y-2">
                    {selectedReport.checklist.pondasiSesuaiDED && (
                      <div className="flex items-center text-sm text-green-600">
                        <Check size={16} className="mr-2" /> Pondasi sesuai DED
                      </div>
                    )}
                    {selectedReport.checklist.materialSNI && (
                      <div className="flex items-center text-sm text-green-600">
                        <Check size={16} className="mr-2" /> Material SNI
                      </div>
                    )}
                    {selectedReport.checklist
                      .strukturBetonSesuaiSpesifikasi && (
                      <div className="flex items-center text-sm text-green-600">
                        <Check size={16} className="mr-2" /> Struktur beton
                        sesuai spesifikasi
                      </div>
                    )}
                    {selectedReport.checklist.keamananKerjaTerjaga && (
                      <div className="flex items-center text-sm text-green-600">
                        <Check size={16} className="mr-2" /> Keamanan kerja
                        terjaga
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedReport.catatanReview && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Catatan Review
                  </h4>
                  <p className="text-sm text-gray-900 whitespace-pre-line">
                    {selectedReport.catatanReview}
                  </p>
                  {selectedReport.Reviewer && (
                    <p className="text-xs text-gray-500 mt-1">
                      Direview oleh: {selectedReport.Reviewer.name} pada{" "}
                      {new Date(selectedReport.reviewedAt).toLocaleDateString(
                        "id-ID"
                      )}
                    </p>
                  )}
                </div>
              )}

              {selectedReport.statusReview === "pending" && (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => handleReview(selectedReport.id, "approved")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Check size={16} />
                    <span>Setujui</span>
                  </button>
                  <button
                    onClick={() => handleReview(selectedReport.id, "rejected")}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                  >
                    <X size={16} />
                    <span>Tolak</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
