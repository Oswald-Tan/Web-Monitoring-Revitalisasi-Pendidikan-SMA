import React, { useState, useEffect } from "react";
import { MapPin, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import {
  MdRemoveRedEye,
  MdEditSquare,
  MdSearch,
  MdKeyboardArrowDown,
} from "react-icons/md";
import ReactPaginate from "react-paginate";
import ButtonAction from "../../../components/ui/ButtonAction";
import Swal from "sweetalert2";
import axios from "axios";
import { API_URL } from "../../../config";
import Button from "../../../components/ui/Button";
import { RiApps2AddFill } from "react-icons/ri";
import { LuSchool } from "react-icons/lu";

const Layout = () => {
  const [schools, setSchools] = useState([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [message, setMessage] = useState("");
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [loading, setLoading] = useState(false);

  // Status icons
  const statusIcons = {
    "on-track": <CheckCircle className="w-4 h-4 text-green-600" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
    delayed: <Clock className="w-4 h-4 text-red-600" />,
    completed: <CheckCircle className="w-4 h-4 text-blue-600" />,
  };

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
    getSchools();
  }, [page, keyword, limit]);

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

  const getSchools = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/schools?search=${keyword}&page=${page}&limit=${limit}`
      );

      if (res.data && res.data.data) {
        setSchools(res.data.data || 0);
        setPages(res.data.totalPage || 0);
        setRows(res.data.totalRows || 0);
        setPage(res.data.page || 0);
      } else {
        console.error("Invalid response structure", res);
      }

      if (res.data.data.length === 0 && page > 0) {
        setPage(0);
      }
    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Daftar Sekolah
            </h2>
            <p className="text-sm text-gray-600">
              Manage and monitor schools
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <LuSchool className="w-4 h-4" />
          <span className="font-medium">{rows} total schools</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Actions */}
          <Button
            text="Add New School"
            to="/super-admin/sekolah/add"
            iconPosition="left"
            icon={<RiApps2AddFill />}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-purple-500/25 hover:shadow-purple-500/40"
          />

          {/* Right Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <form onSubmit={searchData} className="relative">
              <div className="relative group">
                <input
                  type="text"
                  className="w-64 pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 group-hover:shadow-md"
                  placeholder="Search users..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <MdSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </form>

            {/* Limit Selector */}
            <div className="relative">
              <select
                className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
                onChange={(e) => setLimit(e.target.value)}
                value={limit}
              >
                <option value="10">Show 10</option>
                <option value="20">Show 20</option>
                <option value="25">Show 25</option>
              </select>
              <MdKeyboardArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className="overflow-x-auto relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                  <div className="flex items-center">#</div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                  <div className="flex items-center">Nama Sekolah</div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                  <div className="flex items-center">Lokasi</div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                  <div className="flex items-center">Progress</div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                  <div className="flex items-center">Fasilitator</div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                  <div className="flex items-center">Status</div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                  <div className="flex items-center">Actions</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schools.length > 0 ? (
                schools.map((school, index) => (
                  <tr
                    key={school.id}
                    className="text-sm hover:bg-gray-50 transition-colors duration-150 group"
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {page * limit + index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {school.name}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{school.location}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className={`h-2 rounded-full  ${
                              school.progress >= 70
                                ? "bg-green-600"
                                : school.progress >= 50
                                ? "bg-yellow-600"
                                : "bg-red-600"
                            }`}
                            style={{ width: `${school.progress}%` }}
                          ></div>
                        </div>
                        <span>{school.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-gray-600">
                      <div className="text-sm font-medium text-gray-900">
                        {school.facilitator_name}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        {statusIcons[school.status]}
                        <span className="ml-2 capitalize">
                          {school.status.replace("-", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ButtonAction
                          to={`/admin-pusat/sekolah/detail/${school.id}`}
                          icon={<MdRemoveRedEye />}
                          className={"bg-blue-600 hover:bg-blue-700"}
                          tooltip="Lihat"
                        />
                        <ButtonAction
                          to={`/admin-pusat/sekolah/edit/${school.id}`}
                          icon={<MdEditSquare />}
                          className={"bg-orange-600 hover:bg-orange-700"}
                          tooltip="Edit School"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <LuSchool className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          No shools found
                        </h3>
                        <p className="text-sm text-gray-500">
                          {query
                            ? `No school match "${query}"`
                            : "Get started by adding your first user"}
                        </p>
                      </div>
                      {!query && (
                        <Button
                          text="Add First School"
                          to="/super-admin/sekolah/add"
                          iconPosition="left"
                          icon={<RiApps2AddFill />}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition-all duration-200"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Section */}
      {schools.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-medium">
              Showing {page * limit + 1} to {Math.min((page + 1) * limit, rows)}{" "}
              of {rows} users
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
    </div>
  );
};

export default Layout;
