import React, { useState, useEffect } from "react";
import {
  MapPin,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Eye,
  Edit,
  ChevronDown,
} from "lucide-react";
import { MdRemoveRedEye, MdEditSquare } from "react-icons/md";
import ReactPaginate from "react-paginate";
import mockData from "../../data/mockData";
import ButtonAction from "../../components/ui/ButtonAction";

const DaftarSekolah = () => {
  // State untuk pagination dan filter
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // Status icons
  const statusIcons = {
    "on-track": <CheckCircle className="w-4 h-4 text-green-600" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
    delay: <Clock className="w-4 h-4 text-red-600" />,
  };

  // Fungsi untuk memfilter data berdasarkan keyword dan status
  const filteredSchools = mockData.schools.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      school.location.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      school.facilitator.toLowerCase().includes(searchKeyword.toLowerCase());

    const matchesStatus = filterStatus === "" || school.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Hitung jumlah halaman
  const pageCount = Math.ceil(filteredSchools.length / itemsPerPage);

  // Dapatkan data untuk halaman saat ini
  const currentItems = filteredSchools.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Handle perubahan halaman
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Handle perubahan jumlah item per halaman
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(0); // Reset ke halaman pertama
  };

  // Simulasi loading
  useEffect(() => {
    setTableLoading(true);
    const timer = setTimeout(() => {
      setTableLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchKeyword, filterStatus]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4  dark:text-white">
        Daftar Sekolah
      </h2>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative w-full md:w-64">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari sekolah..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none bg-white dark:bg-[#282828]"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          <div className="relative">
            <button
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 bg-white dark:bg-[#282828]"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Filter Status
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="all"
                        name="status"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        checked={filterStatus === ""}
                        onChange={() => setFilterStatus("")}
                      />
                      <label
                        htmlFor="all"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Semua Status
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="on-track"
                        name="status"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        checked={filterStatus === "on-track"}
                        onChange={() => setFilterStatus("on-track")}
                      />
                      <label
                        htmlFor="on-track"
                        className="ml-2 block text-sm text-gray-700 flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                        On Track
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="warning"
                        name="status"
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                        checked={filterStatus === "warning"}
                        onChange={() => setFilterStatus("warning")}
                      />
                      <label
                        htmlFor="warning"
                        className="ml-2 block text-sm text-gray-700 flex items-center"
                      >
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mr-1" />
                        Warning
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="delay"
                        name="status"
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        checked={filterStatus === "delay"}
                        onChange={() => setFilterStatus("delay")}
                      />
                      <label
                        htmlFor="delay"
                        className="ml-2 block text-sm text-gray-700 flex items-center"
                      >
                        <Clock className="w-4 h-4 text-red-600 mr-1" />
                        Delay
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-[#282828] rounded-xl p-4 shadow-md relative">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-sm dark:text-white">
              <th
                scope="col"
                className="px-4 py-2 border-b border-gray-300 dark:border-[#3f3f3f] whitespace-nowrap"
              >
                Nama Sekolah
              </th>
              <th
                scope="col"
                className="px-4 py-2 border-b border-gray-300 dark:border-[#3f3f3f] whitespace-nowrap"
              >
                Lokasi
              </th>
              <th
                scope="col"
                className="px-4 py-2 border-b border-gray-300 dark:border-[#3f3f3f] whitespace-nowrap"
              >
                Progress
              </th>
              <th
                scope="col"
                className="px-4 py-2 border-b border-gray-300 dark:border-[#3f3f3f] whitespace-nowrap"
              >
                Fasilitator
              </th>
              <th
                scope="col"
                className="px-4 py-2 border-b border-gray-300 dark:border-[#3f3f3f] whitespace-nowrap"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-4 py-2 border-b border-gray-300 dark:border-[#3f3f3f] whitespace-nowrap"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#3f3f3f]">
            {tableLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Memuat data sekolah...
                  </p>
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Tidak ada sekolah ditemukan
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Coba gunakan kata kunci pencarian berbeda atau atur ulang
                      filter
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((school) => (
                <tr
                  key={school.id}
                  className="text-sm dark:text-white hover:bg-gray-50 dark:hover:bg-[#333333]"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {school.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-500 mr-1" />
                      <span>{school.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className={`h-2 rounded-full ${
                            school.progress >= 70
                              ? "bg-green-600"
                              : school.progress >= 50
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${school.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {school.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    {school.facilitator}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {statusIcons[school.status]}
                      <span className="ml-2 capitalize">
                        {school.status.replace("-", " ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <ButtonAction
                        to={`/`}
                        icon={<MdRemoveRedEye />}
                        className={"bg-blue-600 hover:bg-blue-700"}
                        tooltip="Lihat"
                      />
                      <ButtonAction
                        to={`/`}
                        icon={<MdEditSquare />}
                        className={"bg-orange-600 hover:bg-orange-700"}
                        tooltip="Edit"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination dengan ReactPaginate */}
      {filteredSchools.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-700 mb-3 sm:mb-0">
            Show {Math.min(itemsPerPage, currentItems.length)} dari{" "}
            {filteredSchools.length} data
          </div>

          {pageCount > 1 && (
            <ReactPaginate
              previousLabel={"<"}
              nextLabel={">"}
              pageCount={pageCount}
              forcePage={currentPage}
              onPageChange={handlePageClick}
              containerClassName="flex items-center gap-1"
              pageLinkClassName="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100"
              previousLinkClassName="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100"
              nextLinkClassName="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100"
              activeLinkClassName="bg-blue-500 text-white border-blue-500"
              disabledLinkClassName="opacity-50 cursor-not-allowed"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DaftarSekolah;
