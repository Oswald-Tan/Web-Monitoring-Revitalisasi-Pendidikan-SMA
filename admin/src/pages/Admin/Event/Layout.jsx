import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../../config";
import Swal from "sweetalert2";
import Button from "../../../components/ui/Button";
import ButtonAction from "../../../components/ui/ButtonAction";
import { RiApps2AddFill } from "react-icons/ri";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  MdEditSquare,
  MdDelete,
  MdSearch,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { GrPowerReset } from "react-icons/gr";
import { BiSolidBell, BiSolidUserDetail } from "react-icons/bi";
import ReactPaginate from "react-paginate";

const Layout = () => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [message, setMessage] = useState("");
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true); // Tambahkan state untuk initial load

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
    // Hanya panggil getEvent jika authUser sudah tersedia
    if (authUser) {
      getEvent();
    }
  }, [page, keyword, limit, authUser, statusFilter]);

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

  const getEvent = async () => {
    setTableLoading(true);
    setMessage("");

    try {
      const res = await axios.get(`${API_URL}/event`, {
        params: {
          search: keyword,
          page: page,
          limit: limit,
          status: statusFilter,
        },
      });

      // Jika tidak ada data yang ditemukan
      if (!res.data || !res.data.result || res.data.result.length === 0) {
        setMessage("Tidak ada data yang ditemukan");
        setEvents([]);
        setPages(0);
        setRows(0);
        return;
      }

      const resultData = res.data.result;
      const totalPage = res.data.totalPage || 0;
      const totalRows = res.data.totalRows || 0;
      const currentPage = res.data.page || 0;

      setEvents(resultData);
      setPages(totalPage);
      setRows(totalRows);
      setPage(currentPage);
      setInitialLoad(false); // Set initialLoad ke false setelah data dimuat
    } catch (error) {
      console.error("Error fetching data", error);

      setEvents([]);
      setPages(0);
      setRows(0);

      // Penanganan error umum
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

  // Tampilkan loading spinner selama initial load
  if (initialLoad && !authUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const deleteEvent = async (eventId) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/event/${eventId}`);
          getEvent();
          Swal.fire("Dihapus!", "Data berhasil dihapus.", "success");
        } catch (error) {
          Swal.fire(
            "Error!",
            error.response?.data?.message || "Terjadi kesalahan",
            "error"
          );
        }
      }
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">Event</h2>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex gap-2">
          <Button
            text="Buat Event Baru"
            to="/create/event"
            iconPosition="left"
            icon={<RiApps2AddFill />}
            width="min-w-[120px]"
            className="bg-purple-500 hover:bg-purple-600"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {/* Filter Status */}
          <div className="flex items-center relative w-full md:w-48">
            <select
              className="px-4 py-3 border dark:text-white border-gray-300 dark:border-[#3f3f3f] rounded-md text-sm appearance-none pr-7 focus:outline-none bg-white dark:bg-[#282828]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              disabled={tableLoading}
            >
              <option value="">Semua Status</option>
              <option value="upcoming">Akan Datang</option>
              <option value="ongoing">Sedang Berlangsung</option>
              <option value="completed">Selesai</option>
            </select>
            <span className="absolute right-3 text-gray-500 pointer-events-none">
              <MdKeyboardArrowDown />
            </span>
          </div>

          <form onSubmit={searchData} className="w-full">
            <div className="flex items-center relative">
              <input
                type="text"
                className="pr-10 pl-4 py-3 border dark:text-white border-gray-300 dark:border-[#3f3f3f] rounded-md w-full text-sm focus:outline-none bg-white dark:bg-[#282828]"
                placeholder="Cari event"
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
              message.includes("Error") ||
              message.includes("Prodi admin tidak ditemukan")
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

        {events.length === 0 && !tableLoading && !message ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              Tidak ada data event
            </div>
            <div className="text-sm text-gray-400">
              {keyword
                ? `Tidak ditemukan hasil untuk "${keyword}"`
                : "Belum ada data untuk prodi ini"}
            </div>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-300 dark:divide-[#3f3f3f]">
              <thead>
                <tr className="text-sm dark:text-white">
                  <th className="px-4 py-3 text-left font-medium">No</th>
                  <th className="px-4 py-3 text-left font-medium">Judul</th>
                  <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                  <th className="px-4 py-3 text-left font-medium">Lokasi</th>
                  <th className="px-4 py-3 text-left font-medium">Tipe</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#3f3f3f]">
                {events.map((event, index) => (
                  <tr
                    key={event.id}
                    className="text-sm dark:text-white hover:bg-gray-50 dark:hover:bg-[#333333]"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {page * limit + index + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {event.title || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm dark:text-white">
                        {format(new Date(event.start), "dd MMM yyyy HH:mm", {
                          locale: id,
                        })}{" "}
                        -{" "}
                        {format(new Date(event.end), "dd MMM yyyy HH:mm", {
                          locale: id,
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {event.location || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          event.type === "Meeting"
                            ? "bg-blue-100 text-blue-800"
                            : event.type === "Workshop"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {event.type === "Meeting"
                          ? "Meeting"
                          : event.type === "Workshop"
                          ? "Workshop"
                          : "Event"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          event.status === "upcoming"
                            ? "bg-blue-100 text-blue-800"
                            : event.status === "ongoing"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {event.status === "upcoming"
                          ? "Akan Datang"
                          : event.status === "ongoing"
                          ? "Sedang Berlangsung"
                          : "Selesai"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <ButtonAction
                          to={`/event/${event.id}/notifications`}
                          icon={<BiSolidBell size={16} />} // Pastikan mengimpor icon
                          className="bg-indigo-600 hover:bg-indigo-700"
                          tooltip="Lihat Status Notifikasi"
                        />
                        {/* Tombol Edit - Disabled jika event sudah selesai */}
                        {event.status === "completed" ? (
                          <ButtonAction
                            onClick={() => {
                              Swal.fire({
                                title: "Event Telah Berakhir",
                                text: "Anda tidak dapat mengedit event yang sudah selesai.",
                                icon: "info",
                                confirmButtonColor: "#3085d6",
                              });
                            }}
                            icon={<MdEditSquare size={16} />}
                            className="bg-gray-400 hover:bg-gray-400 cursor-not-allowed opacity-70"
                            tooltip="Event telah berakhir"
                          />
                        ) : (
                          <ButtonAction
                            to={`/edit/${event.id}/event`}
                            icon={<MdEditSquare size={16} />}
                            className="bg-blue-600 hover:bg-blue-700"
                            tooltip="Edit"
                          />
                        )}
                        <ButtonAction
                          onClick={() => deleteEvent(event.id)}
                          icon={<MdDelete size={16} />}
                          className="bg-red-600 hover:bg-red-700"
                          tooltip="Hapus"
                        />
                      </div>
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
            Show {Math.min(limit, events.length)} dari {rows} data
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
  );
};

export default Layout;
