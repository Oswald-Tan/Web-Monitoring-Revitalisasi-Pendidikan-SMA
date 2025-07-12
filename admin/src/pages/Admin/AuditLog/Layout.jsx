import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../../config";
import Swal from "sweetalert2";
import {
  MdSearch,
  MdDelete,
  MdKeyboardArrowDown,
  MdOutlineDescription,
} from "react-icons/md";
import ReactPaginate from "react-paginate";
import ButtonAction from "../../../components/ui/ButtonAction";
import Button from "../../../components/ui/Button";

const actionOptions = ["login", "logout", "create", "update", "delete"];
const entityOptions = ["user", "arsip", "surat"];

const Layout = () => {
  const [logs, setLogs] = useState([]);
  const [action, setAction] = useState("");
  const [entity, setEntity] = useState("");
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
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user: authUser } = useSelector((state) => state.auth);

  const changePage = ({ selected }) => {
    setPage(selected);
    setMessage("");
    setSelectedLogs([]); // Reset seleksi saat pindah halaman
  };

  const searchData = (e) => {
    e.preventDefault();
    setPage(0);
    setMessage("");
    setKeyword(query);
    setSelectedLogs([]); // Reset seleksi saat mencari
  };

  useEffect(() => {
    if (authUser) {
      getAuditLogs();
    }
  }, [page, keyword, limit, action, entity, authUser]);

  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      setKeyword(query);
      setPage(0);
      setSelectedLogs([]); // Reset seleksi saat mengetik
    }, 500);

    setTypingTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [query]);

  const getAuditLogs = async () => {
    setTableLoading(true);
    setMessage("");

    try {
      const res = await axios.get(`${API_URL}/audit-logs`, {
        params: {
          search: keyword,
          page: page,
          limit: limit,
          action: action,
          entity: entity,
        },
      });

      if (!res.data || !res.data.results || res.data.results.length === 0) {
        setMessage("Tidak ada data log ditemukan");
        setLogs([]);
        setPages(0);
        setRows(0);
        return;
      }

      const resultData = res.data.results;
      const totalPage = res.data.totalPage || 0;
      const totalRows = res.data.totalRows || 0;
      const currentPage = res.data.page || 0;

      setLogs(resultData);
      setPages(totalPage);
      setRows(totalRows);
      setPage(currentPage);
      setInitialLoad(false);
    } catch (error) {
      console.error("Error fetching audit logs", error);

      setLogs([]);
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

  const formatDateTime = (dateString) => {
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const getActionColor = (action) => {
    switch (action) {
      case "login":
        return "bg-blue-100 text-blue-800";
      case "logout":
        return "bg-gray-100 text-gray-800";
      case "create":
        return "bg-green-100 text-green-800";
      case "update":
        return "bg-yellow-100 text-yellow-800";
      case "delete":
        return "bg-red-100 text-red-800";
      default:
        return "bg-purple-100 text-purple-800";
    }
  };

  const deleteSingleLog = async (logId) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Anda tidak akan dapat mengembalikan log ini!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        setIsDeleting(true);
        await axios.delete(`${API_URL}/audit-logs/${logId}`);

        // Update state tanpa refetch
        setLogs(logs.filter((log) => log.id !== logId));
        setRows(rows - 1);

        // Hapus dari selectedLogs jika ada
        setSelectedLogs(selectedLogs.filter((id) => id !== logId));

        // Tampilkan notifikasi sukses
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Log berhasil dihapus.",
        });

        getAuditLogs(); 
      } catch (error) {
        console.error("Error deleting log", error);

        // Tampilkan notifikasi error
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text:
            "Gagal menghapus log: " +
            (error.response?.data?.message || error.message),
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const deleteSelectedLogs = async () => {
    if (selectedLogs.length === 0) return;

    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      html: `Anda akan menghapus <b>${selectedLogs.length}</b> log terpilih.<br>Anda tidak akan dapat mengembalikan ini!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Ya, hapus ${selectedLogs.length} log!`,
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        setIsDeleting(true);
        await axios.delete(`${API_URL}/audit-logs`, {
          data: { ids: selectedLogs },
        });

        // Update state tanpa refetch
        setLogs(logs.filter((log) => !selectedLogs.includes(log.id)));
        setRows(rows - selectedLogs.length);
        setSelectedLogs([]);

        // Tampilkan notifikasi sukses
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: `${selectedLogs.length} log berhasil dihapus.`,
        });

        setSelectedLogs([]);
        getAuditLogs();
      } catch (error) {
        console.error("Error deleting logs", error);

        // Tampilkan notifikasi error
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text:
            "Gagal menghapus log terpilih: " +
            (error.response?.data?.message || error.message),
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Fungsi untuk menangani pemilihan log
  const handleSelectLog = (logId) => {
    if (selectedLogs.includes(logId)) {
      setSelectedLogs(selectedLogs.filter((id) => id !== logId));
    } else {
      setSelectedLogs([...selectedLogs, logId]);
    }
  };

  // Fungsi untuk memilih semua log di halaman saat ini
  const handleSelectAll = () => {
    if (selectedLogs.length === logs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(logs.map((log) => log.id));
    }
  };

  if (initialLoad && !authUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">
        Log Aktivitas
      </h2>

      <div className="flex flex-col w-full md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex gap-2"></div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="flex gap-2">
            <div className="flex items-center relative">
              <select
                className="px-4 py-3 border dark:text-white border-gray-300 dark:border-[#3f3f3f] rounded-md text-sm appearance-none pr-8 focus:outline-none bg-white dark:bg-[#282828]"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                disabled={tableLoading || isDeleting}
              >
                <option value="">Semua Aksi</option>
                {actionOptions.map((action, index) => (
                  <option key={index} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
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
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                disabled={tableLoading || isDeleting}
              >
                <option value="">Semua Entitas</option>
                {entityOptions.map((entity, index) => (
                  <option key={index} value={entity}>
                    {entity.charAt(0).toUpperCase() + entity.slice(1)}
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
                placeholder="Cari log..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={tableLoading || isDeleting}
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
                disabled={tableLoading || isDeleting}
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
              message.includes("Gagal") || message.includes("Error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
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

        {logs.length > 0 && !tableLoading && (
          <div className="mb-4 flex justify-between items-center">
            <div>
              {selectedLogs.length > 0 && (
                <Button
                  text="Delete Selected Logs"
                  onClick={deleteSelectedLogs}
                  disabled={isDeleting}
                  iconPosition="left"
                  icon={<MdDelete />}
                  width={"min-w-[120px] "}
                  className={`${
                    isDeleting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white`}
                />
              )}
            </div>
          </div>
        )}

        {logs.length === 0 && !tableLoading && !message ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              Tidak ada data log
            </div>
            <div className="text-sm text-gray-400">
              {keyword
                ? `Tidak ditemukan hasil untuk "${keyword}"`
                : "Belum ada data log"}
            </div>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-300 dark:divide-[#3f3f3f]">
              <thead>
                <tr className="text-sm dark:text-white">
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-12">
                    <input
                      type="checkbox"
                      checked={
                        logs.length > 0 && selectedLogs.length === logs.length
                      }
                      onChange={handleSelectAll}
                      disabled={tableLoading || isDeleting}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    No
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Waktu
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Pengguna
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Aksi
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Entitas
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Deskripsi
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#3f3f3f]">
                {logs.map((log, index) => (
                  <tr
                    key={log.id}
                    className={`text-sm dark:text-white hover:bg-gray-50 dark:hover:bg-[#333333] ${
                      selectedLogs.includes(log.id)
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedLogs.includes(log.id)}
                        onChange={() => handleSelectLog(log.id)}
                        disabled={tableLoading || isDeleting}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {page * limit + index + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {log.user ? (
                        <div>
                          <div className="font-medium">{log.user.username}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {log.user.email}
                          </div>
                        </div>
                      ) : (
                        "System"
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.entity}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <MdOutlineDescription className="mr-1" />
                        <span className="truncate max-w-xs">
                          {log.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <ButtonAction
                        onClick={() => deleteSingleLog(log.id)}
                        icon={<MdDelete />}
                        className={"bg-red-600 hover:bg-red-700"}
                        tooltip="Hapus log"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {(rows > 0 || pages > 0) && (
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Show {Math.min(limit, logs.length)} dari {rows} data
          </div>

          {pages > 1 && (
            <ReactPaginate
              previousLabel={"<"}
              nextLabel={">"}
              pageCount={pages}
              forcePage={page}
              onPageChange={changePage}
              containerClassName="flex items-center gap-1"
              pageLinkClassName="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
              previousLinkClassName="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
              nextLinkClassName="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
              activeLinkClassName="bg-purple-500 text-white border-purple-500"
              disabledLinkClassName="opacity-50 cursor-not-allowed"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Layout;
