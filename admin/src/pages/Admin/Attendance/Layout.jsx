import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../../config";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  MdSearch,
  MdKeyboardArrowDown,
  MdOutlineEvent,
  MdEditSquare,
  MdDelete,
} from "react-icons/md";
import { BiSolidUserDetail } from "react-icons/bi";
import ReactPaginate from "react-paginate";
import ButtonAction from "../../../components/ui/ButtonAction";

const Layout = () => {
  const [attendances, setAttendances] = useState([]);
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
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [eventStatus, setEventStatus] = useState(""); // State untuk status event

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

  // Ambil daftar event untuk dropdown
  const getEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/event`, {
        params: {
          page: 0,
          limit: 100, // Ambil semua event
        },
      });

      if (res.data && res.data.result && res.data.result.length > 0) {
        setEvents(res.data.result);
        // Set event pertama sebagai default
        if (res.data.result.length > 0) {
          setSelectedEvent(res.data.result[0].id);
          // Set status event pertama
          setEventStatus(res.data.result[0].status);
        }
      }
    } catch (error) {
      console.error("Error fetching events", error);
    }
  };

  useEffect(() => {
    if (authUser) {
      getEvents();
    }
  }, [authUser]);

  useEffect(() => {
    if (selectedEvent) {
      // Cari status event yang dipilih
      const selected = events.find((event) => event.id == selectedEvent);
      if (selected) {
        setEventStatus(selected.status);
      }
      getAttendance();
    }
  }, [page, keyword, limit, selectedEvent]);

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

  const getAttendance = async () => {
    setTableLoading(true);
    setMessage("");

    try {
      const res = await axios.get(
        `${API_URL}/attendance/events/${selectedEvent}/attendances`,
        {
          params: {
            search: keyword,
            page: page,
            limit: limit,
          },
        }
      );

      if (!res.data.result || res.data.result.length === 0) {
        setMessage("Tidak ada data kehadiran untuk event ini");
        setAttendances([]);
        setPages(0);
        setRows(0);
        return;
      }

      setAttendances(res.data.result);
      setPages(res.data.totalPage);
      setRows(res.data.totalRows);
      setInitialLoad(false);
    } catch (error) {
      console.error("Error fetching attendance", error);
      setAttendances([]);
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

  if (initialLoad && !authUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Format status kehadiran
  const formatStatus = (status) => {
    const statusMap = {
      hadir: { text: "Hadir", className: "bg-green-100 text-green-800" },
      tidak_hadir: {
        text: "Tidak Hadir",
        className: "bg-red-100 text-red-800",
      },
      izin: { text: "Izin", className: "bg-yellow-100 text-yellow-800" },
    };

    return (
      statusMap[status] || {
        text: status,
        className: "bg-gray-100 text-gray-800",
      }
    );
  };

  // Format status event
  const formatEventStatus = (status) => {
    const statusMap = {
      upcoming: { text: "Akan Datang", className: "bg-blue-100 text-blue-800" },
      ongoing: {
        text: "Sedang Berlangsung",
        className: "bg-yellow-100 text-yellow-800",
      },
      completed: { text: "Selesai", className: "bg-green-100 text-green-800" },
    };

    return (
      statusMap[status] || {
        text: status,
        className: "bg-gray-100 text-gray-800",
      }
    );
  };

  const deleteAttendance = async (id) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data kehadiran akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/attendance/${id}`);
          getAttendance();
          Swal.fire("Dihapus!", "Data kehadiran berhasil dihapus.", "success");
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
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">Kehadiran</h2>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex flex-col justify-between sm:flex-row gap-2 w-full">
          {/* Pilih Event */}
          <div className="flex items-center relative w-full md:w-64">
            <select
              className="pr-10 pl-4 py-3 border dark:text-white border-gray-300 dark:border-[#3f3f3f] appearance-none rounded-md w-full text-sm focus:outline-none bg-white dark:bg-[#282828]"
              value={selectedEvent}
              onChange={(e) => {
                setSelectedEvent(e.target.value);
                // Update status saat event berubah
                const selected = events.find(
                  (event) => event.id == e.target.value
                );
                if (selected) setEventStatus(selected.status);
              }}
              disabled={tableLoading || events.length === 0}
            >
              {events.length === 0 ? (
                <option value="">Loading events...</option>
              ) : (
                events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))
              )}
            </select>
            <MdOutlineEvent
              size={20}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <span className="absolute right-3 text-gray-500 pointer-events-none">
              <MdKeyboardArrowDown />
            </span>
          </div>

          <div className="flex gap-2">
            {/* Pencarian */}
            <form onSubmit={searchData} className="w-full">
              <div className="flex items-center relative">
                <input
                  type="text"
                  className="pr-10 pl-4 py-3 border dark:text-white border-gray-300 dark:border-[#3f3f3f] rounded-md w-full text-sm focus:outline-none bg-white dark:bg-[#282828]"
                  placeholder="Cari peserta..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <MdSearch
                  size={20}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </form>

            {/* Jumlah baris */}
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
      </div>

      {/* Tampilkan status event di sini */}
      {selectedEvent && (
        <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <span className="font-medium dark:text-white">Status Event:</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                formatEventStatus(eventStatus).className
              }`}
            >
              {formatEventStatus(eventStatus).text}
            </span>
          </div>
        </div>
      )}

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

        {attendances.length === 0 && !tableLoading && !message ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              Tidak ada data kehadiran
            </div>
            <div className="text-sm text-gray-400">
              {keyword
                ? `Tidak ditemukan hasil untuk "${keyword}"`
                : "Belum ada data kehadiran untuk event ini"}
            </div>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-300 dark:divide-[#3f3f3f]">
              <thead>
                <tr className="text-sm dark:text-white">
                  <th className="px-4 py-3 text-left font-medium">No</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Nama Peserta
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Waktu Kehadiran
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Catatan</th>
                  <th className="px-4 py-3 text-left font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#3f3f3f]">
                {attendances.map((attendance, index) => {
                  const statusInfo = formatStatus(attendance.status);
                  return (
                    <tr
                      key={attendance.id}
                      className="text-sm dark:text-white hover:bg-gray-50 dark:hover:bg-[#333333]"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {page * limit + index + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {attendance.user?.fullname || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {attendance.user?.email || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.className}`}
                        >
                          {statusInfo.text}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {attendance.attended_at
                          ? format(
                              new Date(attendance.attended_at),
                              "dd MMM yyyy HH:mm",
                              { locale: id }
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {attendance.notes || "-"}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          <ButtonAction
                            to={`/users/edit/${attendance.id}/dosen`}
                            icon={<MdEditSquare />}
                            className={"bg-blue-600 hover:bg-blue-700"}
                            tooltip="Edit"
                          />
                          <ButtonAction
                            onClick={() => deleteAttendance(attendance.id)}
                            icon={<MdDelete />}
                            className={"bg-red-600 hover:bg-red-700"}
                            tooltip="Hapus"
                          />
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
            Show {Math.min(limit, attendances.length)} dari {rows} data
          </div>

          {pages > 1 && (
            <ReactPaginate
              previousLabel={"<"}
              nextLabel={">"}
              pageCount={pages}
              forcePage={page}
              onPageChange={changePage}
              containerClassName="flex items-center gap-1"
              pageLinkClassName="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white" // Tambah dark:text-white di sini
              previousLinkClassName="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white" // Tambah dark:text-white di sini
              nextLinkClassName="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white" // Tambah dark:text-white di sini
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
