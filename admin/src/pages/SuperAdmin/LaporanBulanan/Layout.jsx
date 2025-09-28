import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { id } from "date-fns/locale";
import axios from "axios";
import { API_URL } from "../../../config";
import { MdKeyboardArrowDown } from "react-icons/md";
import Swal from "sweetalert2";
import { Download } from "lucide-react";

const Layout = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchMonthlyReports();
  }, [selectedMonth, selectedYear]);

  const fetchMonthlyReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/monthly-reports?month=${selectedMonth}&year=${selectedYear}`
      );

      // Pastikan hanya satu laporan per sekolah
      const uniqueReports = [];
      const schoolIds = new Set();
      
      response.data.data.forEach((report) => {
        if (!schoolIds.has(report.schoolId)) {
          schoolIds.add(report.schoolId);
          uniqueReports.push({
            ...report,
            plannedProgress: report.data ? report.data.plannedProgress || 0 : 0,
            variance: report.data ? report.data.variance || 0 : 0,
            weeklyReviews: report.data?.weeklyReviews || [],
          });
        }
      });

      setReports(uniqueReports);
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data laporan",
        text: error.response?.data?.error || "Terjadi kesalahan saat memuat data laporan",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`${API_URL}/monthly-reports/generate`, {
        month: selectedMonth,
        year: selectedYear,
      });

      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Berhasil digenerate",
          text: "Laporan bulanan berhasil digenerate",
          showConfirmButton: false,
          timer: 1500,
        });
        fetchMonthlyReports();
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal generate laporan",
        text: error.response?.data?.error || "Terjadi kesalahan saat generate laporan",
      });
    } finally {
      setGenerating(false);
    }
  };

  const exportMonthlyPDF = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/monthly-reports/export/pdf?month=${selectedMonth}&year=${selectedYear}`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `laporan-bulanan-${selectedMonth}-${selectedYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting PDF:", error);
      Swal.fire("Error", "Gagal mengekspor PDF", "error");
    }
  };

  const getStatusFromVariance = (variance) => {
    if (variance >= 5) return "LEBIH CEPAT";
    if (variance <= -10) return "TERLAMBAT";
    return "ON-TRACK";
  };

  const getStatusColor = (variance) => {
    if (variance >= 5) return "bg-green-500";
    if (variance <= -10) return "bg-pink-500";
    return "bg-blue-500";
  };

  const formatCurrency = (amount) => {
    if (!amount) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: format(new Date(2023, i, 1), "MMMM", { locale: id }),
  }));

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i;
    return { value: year, label: year.toString() };
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Laporan Bulanan
          </h2>
          <p className="text-sm text-gray-600">
            Kelola dan tinjau laporan bulanan revitalisasi satuan pendidikan
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Bulan
            </label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <MdKeyboardArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Tahun
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
              >
                {yearOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <MdKeyboardArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={generating}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Laporan"}
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-2">
          Periode:{" "}
          {format(
            startOfMonth(new Date(selectedYear, selectedMonth - 1)),
            "dd MMMM yyyy",
            { locale: id }
          )}
          {" "}-{" "}
          {format(
            endOfMonth(new Date(selectedYear, selectedMonth - 1)),
            "dd MMMM yyyy",
            { locale: id }
          )}
        </p>
      </div>

      <button
        onClick={exportMonthlyPDF}
        className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center"
      >
        <Download size={18} className="mr-2" />
        Export PDF
      </button>

      {loading ? (
        <div className="p-8 text-center">
          <p>Memuat data laporan...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">
            Tidak ada laporan untuk periode yang dipilih
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {/* Header Info */}
          <div className="text-center mb-4">
            <h1 className="font-bold uppercase text-lg">MONTHLY REPORT</h1>
            <p>
              PROGRAM REVITALISASI BANGUNAN SATUAN PENDIDIKAN SMA - TAHUN{" "}
              {selectedYear}
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border border-black text-[10px]">
              <thead>
                <tr className="bg-gray-200 text-center">
                  <th rowSpan={2} className="border p-1 w-[2%]">
                    NO
                  </th>
                  <th rowSpan={2} className="border p-1 w-[20%]">
                    NAMA SEKOLAH DAN PIC/P2SP
                  </th>
                  <th rowSpan={2} className="border p-1 w-[15%]">
                    DATA DASAR BANPER
                  </th>
                  <th colSpan={3} className="border p-1 w-[20%]">
                    PRESTASI PEKERJAAN SD MINGGU INI (%)
                  </th>
                  <th rowSpan={2} className="border p-1 w-[30%]">
                    PENCAPAIAN TAHAPAN PEKERJAAN DAN LANGKAH TINDAK LANJUT
                  </th>
                </tr>
                <tr className="bg-gray-200 text-center">
                  <th className="border p-1">REA</th>
                  <th className="border p-1">REN</th>
                  <th className="border p-1">GRAFIS</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr key={report.id} className="align-top">
                    <td className="border p-1 text-center">{index + 1}</td>
                    <td className="border p-1">
                      <b>{report.School.name}</b>
                      <br />
                      {report.School.kabupaten}
                      <br />
                      {report.data &&
                        report.data.school &&
                        report.data.school.facilitator && (
                          <span className="text-[9px]">
                            {report.data.school.facilitator.name} (KS):{" "}
                            {report.data.school.facilitator.phone}
                          </span>
                        )}
                    </td>
                    <td className="border p-1">
                      <p>
                        <b>NILAI BANPER</b> :{" "}
                        {formatCurrency(report.School.nilaiBanper)}
                      </p>
                      <p>
                        <b>DURASI</b> : {report.School.durasi} HARI
                      </p>
                      <p>
                        <b>START (PKS)</b> :{" "}
                        {formatDate(report.School.startDate)}
                      </p>
                      <p>
                        <b>FINISH</b> : {formatDate(report.School.finishDate)}
                      </p>
                    </td>

                    {/* REA */}
                    <td className="border p-1 text-center font-bold text-blue-800">
                      {report.progress.toFixed(2)}
                    </td>

                    {/* REN */}
                    <td className="border p-1 text-center font-bold text-orange-600">
                      {report.plannedProgress.toFixed(2)}
                    </td>

                    {/* GRAFIS */}
                    <td className="border p-1 text-center">
                      {/* Progress bar REA */}
                      <div className="mb-2">
                        <div className="flex items-center gap-1">
                          <div className="w-full bg-gray-200 h-3 relative mb-1">
                            <div
                              className="bg-blue-600 h-3 absolute top-0 left-0"
                              style={{ width: `${report.progress}%` }}
                            ></div>
                          </div>
                          <div className="">{report.progress.toFixed(2)}%</div>
                        </div>
                      </div>

                      {/* Progress bar REN */}
                      <div className="mb-2">
                        <div className="flex items-center gap-1">
                          <div className="w-full bg-gray-200 h-3 relative mb-1">
                            <div
                              className="bg-orange-500 h-3 absolute top-0 left-0"
                              style={{ width: `${report.plannedProgress}%` }}
                            ></div>
                          </div>
                          <div className="">
                            {report.plannedProgress.toFixed(2)}%
                          </div>
                        </div>
                      </div>

                      {/* Status dan variance */}
                      <div
                        className={`mt-1 text-white text-[9px] px-2 rounded ${getStatusColor(
                          report.variance
                        )}`}
                      >
                        {getStatusFromVariance(report.variance)}
                      </div>
                      <div className="mt-1 text-sm">
                        {report.variance >= 0 ? "+" : ""}
                        {report.variance.toFixed(2)}
                      </div>
                    </td>

                    <td className="border p-1 text-justify">
                      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {report.weeklyReviews && report.weeklyReviews.length > 0
                          ? report.weeklyReviews.map((review, index) => (
                              <div key={index} className="mb-2">
                                <p>
                                  <strong>Minggu {review.weekNumber}:</strong>
                                </p>
                                {review.notes && (
                                  <p>Pencapaian: {review.notes}</p>
                                )}
                                {review.recommendations && (
                                  <p>Tindak Lanjut: {review.recommendations}</p>
                                )}
                              </div>
                            ))
                          : "Tidak ada data"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;