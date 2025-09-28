import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import { Download, Calendar, Search, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import { MdEditSquare, MdKeyboardArrowDown } from "react-icons/md";
import ButtonAction from "../../../components/ui/ButtonAction";
import { FaFilePdf } from "react-icons/fa";

const convertToRoman = (num) => {
  const romanNumerals = [
    { value: 1000, symbol: "M" },
    { value: 900, symbol: "CM" },
    { value: 500, symbol: "D" },
    { value: 400, symbol: "CD" },
    { value: 100, symbol: "C" },
    { value: 90, symbol: "XC" },
    { value: 50, symbol: "L" },
    { value: 40, symbol: "XL" },
    { value: 10, symbol: "X" },
    { value: 9, symbol: "IX" },
    { value: 5, symbol: "V" },
    { value: 4, symbol: "IV" },
    { value: 1, symbol: "I" },
  ];

  let result = "";
  for (const { value, symbol } of romanNumerals) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
};

const Layout = () => {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState("");
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [existingReviews, setExistingReviews] = useState([]);
  const [commonTechnicalIssues, setCommonTechnicalIssues] = useState({});

  const [notes, setNotes] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [technicalIssues, setTechnicalIssues] = useState([]);
  const [customIssue, setCustomIssue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentReviewId, setCurrentReviewId] = useState(null);
  const [status, setStatus] = useState("draft");

  // Fetch daftar sekolah
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await axios.get(`${API_URL}/schools`);
        setSchools(res.data.data || res.data);
      } catch (error) {
        console.error("Error fetching schools:", error);
        Swal.fire("Error", "Gagal mengambil data sekolah", "error");
      }
    };
    fetchSchools();
  }, []);

  // Fetch masalah teknis umum
  useEffect(() => {
    const fetchCommonIssues = async () => {
      try {
        const res = await axios.get(`${API_URL}/weekly-reviews/common-technical-issues`);
        setCommonTechnicalIssues(res.data.data);
      } catch (error) {
        console.error("Error fetching common technical issues:", error);
      }
    };
    fetchCommonIssues();
  }, []);

  // Generate daftar minggu dalam tahun
  useEffect(() => {
    const generateWeeks = () => {
      const weeksArray = [];
      for (let i = 1; i <= 52; i++) {
        weeksArray.push(i);
      }
      setWeeks(weeksArray);
    };
    generateWeeks();
  }, [selectedYear]);

  // Fetch data review yang sudah ada
  useEffect(() => {
    if (selectedSchool) {
      fetchExistingReviews();
    }
  }, [selectedSchool, selectedYear]);

  const fetchExistingReviews = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/weekly-reviews?schoolId=${selectedSchool}&year=${selectedYear}`
      );
      setExistingReviews(res.data.data || []);
    } catch (error) {
      console.error("Error fetching existing reviews:", error);
    }
  };

  const fetchWeeklyData = async () => {
    if (!selectedSchool || !selectedWeek) {
      Swal.fire(
        "Peringatan",
        "Pilih sekolah dan minggu terlebih dahulu",
        "warning"
      );
      return;
    }

    setLoading(true);
    try {
      const startDate = getDateOfISOWeek(
        parseInt(selectedWeek),
        parseInt(selectedYear)
      );
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const res = await axios.get(
        `${API_URL}/weekly-reviews/aggregate?schoolId=${selectedSchool}&weekNumber=${selectedWeek}&year=${selectedYear}&startDate=${formatDate(
          startDate
        )}&endDate=${formatDate(endDate)}`
      );

      setReviewData(res.data.data);

      // Jika sudah ada review, isi form dengan data yang ada
      if (res.data.data.existingReview) {
        const review = res.data.data.existingReview;
        setNotes(review.notes || "");
        setRecommendations(review.recommendations || "");
        setTechnicalIssues(review.technicalIssues || []);
        setStatus(review.status);
        setCurrentReviewId(review.id);
        setIsEditing(true);
      } else {
        setNotes("");
        setRecommendations("");
        setTechnicalIssues([]);
        setStatus("draft");
        setCurrentReviewId(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error fetching weekly data:", error);
      Swal.fire("Error", "Gagal mengambil data mingguan", "error");
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!selectedSchool || !selectedWeek || !selectedYear) {
      Swal.fire(
        "Peringatan",
        "Pilih sekolah, minggu dan tahun terlebih dahulu",
        "warning"
      );
      return;
    }

    try {
      const startDate = getDateOfISOWeek(
        parseInt(selectedWeek),
        parseInt(selectedYear)
      );
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const response = await axios.get(
        `${API_URL}/weekly-reviews/export/aggregate?schoolId=${selectedSchool}&weekNumber=${selectedWeek}&year=${selectedYear}&startDate=${formatDate(
          startDate
        )}&endDate=${formatDate(endDate)}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan_Mingguan_${selectedSchool}_Minggu_${selectedWeek}_${selectedYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      Swal.fire("Error", "Gagal mengekspor PDF", "error");
    }
  };

  const saveReview = async (newStatus = status) => {
    if (!reviewData) return;

    try {
      const startDateObj = getDateOfISOWeek(
        parseInt(selectedWeek),
        parseInt(selectedYear)
      );
      const endDateObj = new Date(startDateObj);
      endDateObj.setDate(startDateObj.getDate() + 6);

      const reviewDataToSave = {
        schoolId: selectedSchool,
        weekNumber: selectedWeek,
        year: selectedYear,
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
        notes,
        recommendations,
        technicalIssues,
        data: reviewData,
        status: newStatus
      };

      if (currentReviewId) {
        await axios.put(
          `${API_URL}/weekly-reviews/${currentReviewId}`,
          reviewDataToSave
        );
        Swal.fire("Sukses", "Review mingguan berhasil diperbarui", "success");
      } else {
        await axios.post(`${API_URL}/weekly-reviews`, reviewDataToSave);
        Swal.fire("Sukses", "Review mingguan berhasil disimpan", "success");
      }

      setStatus(newStatus);
      fetchExistingReviews();
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving review:", error);
      Swal.fire(
        "Error",
        `Gagal menyimpan review: ${
          error.response?.data?.error || error.message
        }`,
        "error"
      );
    }
  };

  const updateReviewStatus = async (newStatus) => {
    if (!currentReviewId) {
      Swal.fire("Peringatan", "Simpan review terlebih dahulu", "warning");
      return;
    }

    try {
      await axios.put(`${API_URL}/weekly-reviews/${currentReviewId}/status`, {
        status: newStatus
      });

      setStatus(newStatus);
      Swal.fire("Sukses", `Status review berhasil diubah menjadi ${newStatus}`, "success");
      fetchExistingReviews();
    } catch (error) {
      console.error("Error updating review status:", error);
      Swal.fire("Error", "Gagal mengubah status review", "error");
    }
  };

  const loadReview = (review) => {
    setSelectedWeek(review.weekNumber);
    setSelectedYear(review.year);
    setNotes(review.notes || "");
    setRecommendations(review.recommendations || "");
    setTechnicalIssues(review.technicalIssues || []);
    setStatus(review.status);
    setCurrentReviewId(review.id);
    setIsEditing(true);
  };

  const addTechnicalIssue = (issue) => {
    if (issue && !technicalIssues.includes(issue)) {
      setTechnicalIssues([...technicalIssues, issue]);
    }
  };

  const addCustomTechnicalIssue = () => {
    if (customIssue && !technicalIssues.includes(customIssue)) {
      setTechnicalIssues([...technicalIssues, customIssue]);
      setCustomIssue("");
    }
  };

  const removeTechnicalIssue = (issueToRemove) => {
    setTechnicalIssues(technicalIssues.filter(issue => issue !== issueToRemove));
  };

  function getDateOfISOWeek(week, year) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOWeekStart = simple;

    if (dow <= 4) {
      ISOWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }

    return ISOWeekStart;
  }

  const formatNumber = (num) => {
    if (num === null || num === undefined || num === "") return "";
    const number = Number(num);
    if (isNaN(number)) return "";

    const rounded = Math.round(number * 10000) / 10000;
    return rounded.toString().replace(/(\.0+$)|(0+$)/, "");
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Reviu Mingguan
          </h2>
          <p className="text-sm text-gray-600">
            Validasi, beri rekomendasi, dan tangani masalah teknis progress revitalisasi
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Pilih Sekolah
            </label>
            <div className="relative">
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
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
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <MdKeyboardArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Minggu
            </label>
            <div className="relative">
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
              >
                <option value="">Pilih Minggu</option>
                {weeks.map((week) => (
                  <option key={week} value={week}>
                    Minggu {week}
                  </option>
                ))}
              </select>
              <MdKeyboardArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchWeeklyData}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 flex items-center justify-center"
            >
              {loading ? (
                "Memuat..."
              ) : (
                <>
                  <Search size={18} className="mr-2" />
                  Tampilkan Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Existing Reviews Section */}
      {existingReviews.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Review Tersimpan</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                    Minggu
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                    Tahun
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                    Catatan
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {existingReviews.map((review) => {
                  const isReviewMatch =
                    selectedWeek &&
                    selectedYear &&
                    parseInt(selectedWeek) === review.weekNumber &&
                    selectedYear === review.year;

                  return (
                    <tr
                      key={review.id}
                      className="text-sm hover:bg-gray-50 transition-colors duration-150 group"
                    >
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                        Minggu {review.weekNumber}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                        {review.year}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            review.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : review.status === "submitted"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {review.status === "approved"
                            ? "Disetujui"
                            : review.status === "submitted"
                            ? "Terkirim"
                            : "Draft"}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                        {review.notes ? (
                          <div
                            className="max-w-xs truncate"
                            title={review.notes}
                          >
                            {review.notes}
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            Tidak ada catatan
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-1">
                          {isReviewMatch ? (
                            <ButtonAction
                              onClick={() => loadReview(review)}
                              icon={<MdEditSquare />}
                              className="bg-orange-500 hover:bg-orange-600"
                              title="Edit Review"
                            />
                          ) : (
                            <ButtonAction
                              icon={<MdEditSquare />}
                              className="bg-gray-300 text-gray-500 cursor-not-allowed"
                              title="Hanya bisa edit review untuk minggu dan tahun yang dipilih"
                              disabled
                            />
                          )}
                          {isReviewMatch ? (
                            <ButtonAction
                              onClick={() => exportToPDF(review.id)}
                              icon={<FaFilePdf />}
                              className="bg-red-500 hover:bg-red-600"
                              title="PDF"
                            />
                          ) : (
                            <ButtonAction
                              icon={<FaFilePdf />}
                              className="bg-gray-300 text-gray-500 cursor-not-allowed"
                              title="PDF"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Data Section */}
      {reviewData && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {!reviewData.hasData ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Tidak ada data untuk minggu yang dipilih
              </p>
            </div>
          ) : (
            <>
              {/* Tampilkan header dan tabel hanya jika ada data */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold">
                    Laporan Mingguan - {reviewData.headerInfo.sekolah}
                  </h2>
                  <p className="text-gray-600">
                    Minggu {reviewData.headerInfo.weekNumber} -{" "}
                    {reviewData.headerInfo.year}
                  </p>
                  <p className="text-gray-600">
                    {new Date(
                      reviewData.headerInfo.startDate
                    ).toLocaleDateString("id-ID")}{" "}
                    -{" "}
                    {new Date(reviewData.headerInfo.endDate).toLocaleDateString(
                      "id-ID"
                    )}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={exportToPDF}
                    className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center"
                  >
                    <Download size={18} className="mr-2" />
                    Export PDF
                  </button>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-xs font-medium text-blue-800">
                    Total Bobot
                  </h3>
                  <p className="text-2xl font-bold text-blue-800">
                    {reviewData.headerInfo.totalBobot}%
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-xs font-medium text-green-800">
                    Progress Keseluruhan
                  </h3>
                  <p className="text-2xl font-bold text-green-800">
                    {reviewData.headerInfo.overallProgress}%
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-xs font-medium text-yellow-800">
                    Minggu
                  </h3>
                  <p className="text-2xl font-bold text-yellow-800">
                    {reviewData.headerInfo.weekNumber} /{" "}
                    {reviewData.headerInfo.year}
                  </p>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto min-w-full">
                <table className="min-w-full border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 whitespace-nowrap">
                      <th
                        rowSpan={3}
                        className="border border-gray-300 px-4 py-2 w-12 font-semibold text-xs"
                      >
                        No.
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs"
                      >
                        Uraian Pekerjaan
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs"
                      >
                        Volume
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs"
                      >
                        Sat
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs"
                      >
                        Bobot (%)
                      </th>
                      <th
                        colSpan={6}
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs text-center"
                      >
                        Prestasi Pekerjaan
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs whitespace-nowrap"
                      >
                        Bobot <br />
                        Masing2 <br />
                        Pekerjaan (%)
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs"
                      >
                        Keterangan
                      </th>
                    </tr>
                    <tr className="bg-gray-50">
                      <th
                        colSpan={2}
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs text-center"
                      >
                        s/d Minggu Lalu
                      </th>
                      <th
                        colSpan={2}
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs text-center"
                      >
                        Dalam Minggu Ini
                      </th>
                      <th
                        colSpan={2}
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs text-center"
                      >
                        s/d Minggu Ini
                      </th>
                    </tr>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 font-semibold text-xs">
                        Volume
                      </th>
                      <th className="border border-gray-300 px-4 py-2 font-semibold text-xs">
                        Bobot (%)
                      </th>
                      <th className="border border-gray-300 px-4 py-2 font-semibold text-xs">
                        Volume
                      </th>
                      <th className="border border-gray-300 px-4 py-2 font-semibold text-xs">
                        Bobot (%)
                      </th>
                      <th className="border border-gray-300 px-4 py-2 font-semibold text-xs">
                        Volume
                      </th>
                      <th className="border border-gray-300 px-4 py-2 font-semibold text-xs">
                        Bobot (%)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewData.tableData.map((category, categoryIndex) => {
                      const romanNumeral = convertToRoman(categoryIndex + 1);

                      return (
                        <React.Fragment key={categoryIndex}>
                          <tr className="bg-blue-50">
                            <td className="border border-gray-300 px-4 py-2 font-semibold text-xs text-center">
                              {romanNumeral}
                            </td>
                            <td
                              className="border border-gray-300 px-4 py-2 font-semibold text-xs"
                              colSpan="13"
                            >
                              {category.title}
                            </td>
                          </tr>
                          {category.items.map((item, itemIndex) => (
                            <tr key={itemIndex} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2 text-xs text-center">
                                {item.no}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-xs whitespace-nowrap">
                                {item.uraian}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-xs text-right">
                                {formatNumber(item.volume)}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-xs text-center">
                                {item.sat}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-xs text-right">
                                {formatNumber(item.bobot)}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-xs text-right">
                                {formatNumber(item.sdMingguLaluVolume)}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-xs text-right">
                                {formatNumber(item.sdMingguLaluBobot)}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-xs text-right">
                                {formatNumber(item.dalamMingguIniVolume)}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-xs text-right">
                                {formatNumber(item.dalamMingguIniBobot)}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-xs text-right">
                                {formatNumber(item.sdMingguIniVolume)}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-xs text-right">
                                {formatNumber(item.sdMingguIniBobot)}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-xs text-right">
                                {item.bobotMasing}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-xs">
                                {item.keterangan}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}

                    {/* Footer Table dengan informasi tambahan */}
                    <tr className="bg-gray-100">
                      <td
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs"
                        colSpan="2"
                      >
                        JUMLAH
                      </td>
                      <td
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs text-right"
                        colSpan="1"
                      >
                        {reviewData.totals.volume.toFixed(2)}
                      </td>
                      <td
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs text-right"
                        colSpan="1"
                      >
                        -
                      </td>
                      <td
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs text-right"
                        colSpan="1"
                      >
                        {reviewData.totals.bobot.toFixed(2)}
                      </td>
                      <td
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs text-right"
                        colSpan="1"
                      >
                        {reviewData.totals.sdMingguLaluVolume.toFixed(2)}
                      </td>
                      <td
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs text-right"
                        colSpan="1"
                      >
                        {reviewData.totals.sdMingguLaluBobot.toFixed(2)}
                      </td>
                      <td
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs text-right"
                        colSpan="1"
                      >
                        {reviewData.totals.dalamMingguIniVolume.toFixed(2)}
                      </td>
                      <td
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs text-right"
                        colSpan="1"
                      >
                        {reviewData.totals.dalamMingguIniBobot.toFixed(2)}
                      </td>
                      <td
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs text-right"
                        colSpan="1"
                      >
                        {reviewData.totals.sdMingguIniVolume.toFixed(2)}
                      </td>
                      <td
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs text-right"
                        colSpan="1"
                      >
                        {reviewData.totals.sdMingguIniBobot.toFixed(2)}
                      </td>
                      <td
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs text-right"
                        colSpan="1"
                      >
                        {reviewData.totals.bobotMasing.toFixed(2)}
                      </td>
                      <td
                        className="border border-gray-300 px-4 py-2 font-semibold text-xs text-right"
                        colSpan="1"
                      >
                        -
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Tanda Tangan */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div>
                      <p className="text-xs font-semibold">Mengetahui</p>
                      <p className="text-xs font-semibold">
                        Kepala SMA Negeri 1 Karangreja
                      </p>
                      <p className="text-xs mt-18">Dra. Esti Nurhayati, M.Pd</p>
                      <p className="text-xs">NIP: 19651008 199402 2 005</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <div>
                      <p className="text-xs font-semibold">Mengetahui</p>
                      <p className="text-xs font-semibold">Ketua Komite</p>
                      <p className="text-xs mt-18">
                        Asep Winardi Hermawan, S.Kom
                      </p>
                      <p className="text-xs">NIP: 19760727 200903 1 005</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <div>
                      <p className="text-xs font-semibold">Pengawas</p>
                      <p className="text-xs mt-18">Sutiyanto, S.T.</p>
                      <p className="text-xs">NIP: -</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {reviewData && reviewData.hasData && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Status Indicator */}
          {status === 'approved' && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md mb-4 flex items-center">
              <CheckCircle size={16} className="mr-2" />
              Review ini telah disetujui dan terkunci.
            </div>
          )}
          
          {status === 'submitted' && (
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md mb-4 flex items-center">
              <AlertCircle size={16} className="mr-2" />
              Review telah dikirim dan menunggu persetujuan.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan / Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                disabled={status === 'approved'}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-sm"
                placeholder="Tulis catatan untuk minggu ini..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rekomendasi
              </label>
              <textarea
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                rows={4}
                disabled={status === 'approved'}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-sm"
                placeholder="Tulis rekomendasi untuk minggu depan..."
              />
            </div>
          </div>

          {/* Masalah Teknis Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Masalah Teknis
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Daftar Masalah Umum */}
              {Object.entries(commonTechnicalIssues).map(([category, issues]) => (
                <div key={category} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 capitalize">{category.replace('_', ' ')}</h4>
                  <div className="space-y-1">
                    {issues.map(issue => (
                      <button
                        key={issue}
                        type="button"
                        onClick={() => addTechnicalIssue(issue)}
                        disabled={status === 'approved' || technicalIssues.includes(issue)}
                        className="block w-full text-left text-xs p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {issue}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Masalah Kustom */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={customIssue}
                onChange={(e) => setCustomIssue(e.target.value)}
                disabled={status === 'approved'}
                placeholder="Tambah masalah teknis kustom"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
              />
              <button
                type="button"
                onClick={addCustomTechnicalIssue}
                disabled={status === 'approved' || !customIssue}
                className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tambah
              </button>
            </div>

            {/* Daftar Masalah yang Dipilih */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Masalah Teridentifikasi</h4>
              {technicalIssues.length > 0 ? (
                <ul className="space-y-2">
                  {technicalIssues.map(issue => (
                    <li key={issue} className="flex justify-between items-center bg-white p-2 rounded-md">
                      <span className="text-sm">{issue}</span>
                      <button
                        type="button"
                        onClick={() => removeTechnicalIssue(issue)}
                        disabled={status === 'approved'}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">Belum ada masalah teridentifikasi</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => saveReview('draft')}
              disabled={!reviewData || loading || status === 'approved'}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calendar size={18} className="mr-2" />
              Simpan Draft
            </button>

            <button
              onClick={() => saveReview('submitted')}
              disabled={!reviewData || loading || status === 'approved'}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calendar size={18} className="mr-2" />
              {isEditing ? "Perbarui Review" : "Kirim Review"}
            </button>

            {status !== 'approved' && (
              <button
                onClick={() => updateReviewStatus('approved')}
                disabled={!currentReviewId || status === 'approved'}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={18} className="mr-2" />
                Setujui
              </button>
            )}

            {status === 'approved' && (
              <button
                onClick={() => updateReviewStatus('submitted')}
                className="bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 flex items-center"
              >
                <AlertCircle size={18} className="mr-2" />
                Buka Kembali
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;