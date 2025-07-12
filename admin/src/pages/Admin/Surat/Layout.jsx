import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../../config";
import Swal from "sweetalert2";
import Button from "../../../components/ui/Button";
import { BiSolidUserDetail } from "react-icons/bi";
import ButtonAction from "../../../components/ui/ButtonAction";
import { RiApps2AddFill } from "react-icons/ri";
import {
  MdEditSquare,
  MdSearch,
  MdKeyboardArrowDown,
  MdDownload,
  MdFormatListBulleted,
} from "react-icons/md";
import ReactPaginate from "react-paginate";
import { FaFileAlt, FaFilePdf, FaFileWord } from "react-icons/fa";

const jenisOptions = ["masuk", "keluar"];

const Layout = () => {
  const [surat, setSurat] = useState([]);
  const [jenis, setJenis] = useState("");
  const [status, setStatus] = useState("");
  const [tahun, setTahun] = useState("");
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [message, setMessage] = useState("");
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const { user: authUser } = useSelector((state) => state.auth);

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
    getSurat();
  }, [page, keyword, jenis, status, tahun]);

  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      setKeyword(query);
      setPage(0);
    }, 500);

    setTypingTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [query]);

  const getSurat = async () => {
    setTableLoading(true);
    setMessage("");

    try {
      const res = await axios.get(`${API_URL}/surat`, {
        params: {
          search: keyword,
          page: page,
          limit: limit,
          jenis: jenis,
          status: status,
          tahun: tahun,
        },
      });

      if (!res.data || !res.data.result || res.data.result.length === 0) {
        setMessage("Tidak ada data surat ditemukan");
        setSurat([]);
        setPages(0);
        setRows(0);
        return;
      }

      const resultData = res.data.result;
      const totalPage = res.data.totalPage || 0;
      const totalRows = res.data.totalRows || 0;
      const currentPage = res.data.page || 0;

      setSurat(resultData);
      setPages(totalPage);
      setRows(totalRows);
      setPage(currentPage);
      setInitialLoad(false);
    } catch (error) {
      console.error("Error fetching arsip data", error);

      setSurat([]);
      setPages(0);
      setRows(0);

      if (error.response) {
        if (error.response.status === 400) {
          setMessage(error.response.data.message);
        } else {
          setMessage(
            `Error: ${error.response.status} - ${
              error.response.data.message || "Unknown error"
            }`
          );
        }
      } else if (error.request) {
        setMessage("Network error: Tidak ada respons dari server");
      } else {
        setMessage("Error: " + error.message);
      }
    } finally {
      setTableLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FaFilePdf className="text-red-500" />;
    if (["doc", "docx"].includes(ext))
      return <FaFileWord className="text-blue-500" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  // Generate tahun dari 2020 sampai tahun sekarang
  const generateTahunOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2020; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  };

  if (initialLoad && !authUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">
          Manajemen Surat
        </h2>

        <div className="flex flex-col w-full md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex gap-2">
            <Button
              text="Tambah Surat"
              to="/add/surat"
              iconPosition="left"
              icon={<RiApps2AddFill />}
              width="min-w-[120px]"
              className="bg-purple-500 hover:bg-purple-600"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="flex gap-2">
              <div className="flex items-center relative">
                <select
                  className="px-4 py-3 border dark:text-white border-gray-300 dark:border-[#3f3f3f] rounded-md text-sm appearance-none pr-8 focus:outline-none bg-white dark:bg-[#282828]"
                  value={jenis}
                  onChange={(e) => setJenis(e.target.value)}
                  disabled={tableLoading}
                >
                  <option value="">Semua Jenis</option>
                  {jenisOptions.map((jenis, index) => (
                    <option key={index} value={jenis}>
                      {jenis.charAt(0).toUpperCase() + jenis.slice(1)}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 text-gray-500 pointer-events-none">
                  <MdKeyboardArrowDown />
                </span>
              </div>

              <div className="flex items-center relative">
                <select
                  className="px-4 py-3 border dark:text-white border-gray-300 dark:border-[#3f3f3f] rounded-md text-sm appearance-none pr-8 focus:outline-none bg-white dark:bg-[#282828]"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={tableLoading}
                >
                  <option value="">Semua Status</option>
                  <option value="draft">Draft</option>
                  <option value="menunggu_persetujuan">
                    Menunggu Persetujuan
                  </option>
                  <option value="disetujui">Disetujui</option>
                  <option value="ditolak">Ditolak</option>
                  <option value="selesai">Selesai</option>
                </select>
                <span className="absolute right-3 text-gray-500 pointer-events-none">
                  <MdKeyboardArrowDown />
                </span>
              </div>

              <div className="flex items-center relative">
                <select
                  className="px-4 py-3 border dark:text-white border-gray-300 dark:border-[#3f3f3f] rounded-md text-sm appearance-none pr-8 focus:outline-none bg-white dark:bg-[#282828]"
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  disabled={tableLoading}
                >
                  <option value="">Semua Tahun</option>
                  {generateTahunOptions().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 text-gray-500 pointer-events-none">
                  <MdKeyboardArrowDown />
                </span>
              </div>
            </div>

            <form onSubmit={searchData} className="w-full">
              <div className="flex items-center relative">
                <input
                  type="text"
                  className="pr-10 pl-4 py-3 border dark:text-white border-gray-300 dark:border-[#3f3f3f] rounded-md w-full text-sm focus:outline-none bg-white dark:bg-[#282828]"
                  placeholder="Cari surat..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <MdSearch
                  size={20}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </form>

            <div className="flex gap-2">
              <div className="flex items-center relative">
                <select
                  id="limit"
                  name="limit"
                  className="px-4 py-3 border dark:text-white border-gray-300 dark:border-[#3f3f3f] rounded-md text-sm appearance-none pr-7 focus:outline-none bg-white dark:bg-[#282828]"
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(0);
                  }}
                  disabled={tableLoading}
                >
                  <option value="10">10 baris</option>
                  <option value="25">25 baris</option>
                  <option value="50">50 baris</option>
                  <option value="100">100 baris</option>
                </select>
                <span className="absolute right-3 text-gray-500 pointer-events-none">
                  <MdKeyboardArrowDown />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto bg-white dark:bg-[#282828] rounded-xl p-4 shadow-md relative">
          {message && (
            <div
              className={`mb-4 p-3 rounded-md ${
                message.includes("Error")
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {message}
            </div>
          )}

          {tableLoading && (
            <div className="absolute inset-0 bg-white dark:bg-[#282828] bg-opacity-80 flex items-center justify-center rounded-xl z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}

          {surat.length === 0 && !tableLoading && !message ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 mb-2">
                Tidak ada data surat
              </div>
              <div className="text-sm text-gray-400">
                {keyword
                  ? `Tidak ditemukan hasil untuk "${keyword}"`
                  : "Belum ada data surat"}
              </div>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-300 dark:divide-[#3f3f3f]">
                <thead>
                  <tr className="text-sm dark:text-white">
                    <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                      No
                    </th>
                    <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                      Nomor Surat
                    </th>
                    <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                      Perihal
                    </th>
                    <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                      Jenis
                    </th>
                    <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                      Asal/Tujuan
                    </th>
                    <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#3f3f3f]">
                  {surat.map((item, index) => {
                    return (
                      <tr
                        key={item.id}
                        className="text-sm dark:text-white hover:bg-gray-50 dark:hover:bg-[#333333]"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          {page * limit + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {getFileIcon(item.file_path)}
                            <div className="ml-2">
                              <div className="font-medium">
                                {item.nomor_surat}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full truncate max-w-[200px] inline-block"
                            title={item.perihal}
                          >
                            {item.perihal.length > 100
                              ? `${item.perihal.substring(0, 100)}...`
                              : item.perihal}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full ${
                              item.jenis_surat === "masuk"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {item.jenis_surat === "masuk" ? "Masuk" : "Keluar"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDate(item.tanggal_surat)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {item.asal_tujuan}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.status === "draft"
                                ? "bg-gray-100 text-gray-800"
                                : item.status === "menunggu_persetujuan"
                                ? "bg-yellow-100 text-yellow-800"
                                : item.status === "disetujui"
                                ? "bg-green-100 text-green-800"
                                : item.status === "ditolak"
                                ? "bg-red-100 text-red-800"
                                : "bg-indigo-100 text-indigo-800"
                            }`}
                          >
                            {item.status === "draft"
                              ? "Draft"
                              : item.status === "menunggu_persetujuan"
                              ? "Menunggu Persetujuan"
                              : item.status === "disetujui"
                              ? "Disetujui"
                              : item.status === "ditolak"
                              ? "Ditolak"
                              : "Selesai"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex gap-2">
                            <ButtonAction
                              to={`/surat/${item.id}`}
                              icon={<MdFormatListBulleted />}
                              className={"bg-teal-600 hover:bg-teal-700"}
                              tooltip="Detail"
                            />
                            <ButtonAction
                              to={`/surat/${item.id}/download`}
                              icon={<MdDownload size={16} />}
                              className="bg-green-600 hover:bg-green-700"
                              tooltip="Download"
                            />
                            {authUser.role.includes("admin") && (
                              <ButtonAction
                                to={`/surat/edit/${item.id}`}
                                icon={<MdEditSquare />}
                                className={"bg-blue-600 hover:bg-blue-700"}
                                tooltip="Edit"
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>

        {(rows > 0 || pages > 0) && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Show {Math.min(limit, surat.length)} dari {rows} data
            </div>

            {pages > 1 && (
              <ReactPaginate
                previousLabel={"<"}
                nextLabel={">"}
                pageCount={pages}
                forcePage={page}
                onPageChange={changePage}
                containerClassName="flex items-center gap-1"
                pageLinkClassName="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                previousLinkClassName="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                nextLinkClassName="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                activeLinkClassName="bg-purple-500 text-white border-purple-500"
                disabledLinkClassName="opacity-50 cursor-not-allowed"
              />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Layout;
