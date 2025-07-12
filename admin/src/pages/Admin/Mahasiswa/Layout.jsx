import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import Swal from "sweetalert2";
import Button from "../../../components/ui/Button";
import ButtonAction from "../../../components/ui/ButtonAction";
import { RiApps2AddFill } from "react-icons/ri";
import {
  MdEditSquare,
  MdDelete,
  MdSearch,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { GrPowerReset } from "react-icons/gr";
import { BiSolidUserDetail, BiStats } from "react-icons/bi";
import ReactPaginate from "react-paginate";

const Layout = () => {
  const [users, setUsers] = useState([]);
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
    getUsers();
  }, [page, keyword, limit]);

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

  const getUsers = async () => {
    setTableLoading(true);
    setMessage("");

    try {
      const res = await axios.get(`${API_URL}/mahasiswa/get-all-mahasiswa`, {
        params: {
          search: keyword,
          page: page,
          limit: limit,
        },
      });

      // Jika tidak ada data yang ditemukan
      if (!res.data || !res.data.result || res.data.result.length === 0) {
        setMessage("Tidak ada data yang ditemukan");
        setUsers([]);
        setPages(0);
        setRows(0);
        return;
      }

      // 1. Gunakan optional chaining untuk menghindari error
      const resultData = res.data.result;
      const totalPage = res.data.totalPage || 0;
      const totalRows = res.data.totalRows || 0;
      const currentPage = res.data.page || 0;

      setUsers(resultData);
      setPages(totalPage);
      setRows(totalRows);
      setPage(currentPage);
      setInitialLoad(false);

      console.log("Users data:", resultData);

      // 2. Perbaiki pengecekan data kosong
      if (resultData.length === 0 && page > 0) {
        setPage(0);
      }
    } catch (error) {
      // 3. Perbaiki penanganan error
      console.error("Error fetching data", error);

      // Set state kosong untuk menghindari error render
      setUsers([]);
      setPages(0);
      setRows(0);

      // 4. Tampilkan pesan error hanya jika benar-benar error
      if (error.response) {
        // Server responded with error status (4xx, 5xx)
        setMessage(
          `Error: ${error.response.status} - ${
            error.response.data.message || "Unknown error"
          }`
        );
      } else if (error.request) {
        // Request dibuat tapi tidak ada response
        setMessage("Network error: Tidak ada respons dari server");
      } else {
        // Error lainnya
        setMessage("Error: " + error.message);
      }
    } finally {
      setTableLoading(false);
    }
  };

  if (initialLoad) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const handleReset = async (id) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Password akan direset ke default!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, reset!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(`${API_URL}/auth-web/update-pass/${id}`);
          Swal.fire("Berhasil!", "Password telah direset.", "success");
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

  const deleteUser = async (userId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axios.delete(`${API_URL}/users/user/${userId}`);
        getUsers();

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "User deleted successfully.",
        });
      }
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">Mahasiswa</h2>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex gap-2">
          <Button
            text="Add New"
            to="/users/add/mahasiswa"
            iconPosition="left"
            icon={<RiApps2AddFill />}
            width={"min-w-[120px] "}
            className={"bg-purple-500 hover:bg-purple-600"}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <form onSubmit={searchData} className="w-full">
            <div className="flex items-center relative">
              <input
                type="text"
                className="pr-10 pl-4 py-3 border dark:text-white border-gray-300 dark:border-[#3f3f3f] rounded-md w-full text-sm focus:outline-none bg-white dark:bg-[#282828]"
                placeholder="Cari nama atau NIM..."
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

      <div className="mt-5 overflow-x-auto bg-white dark:bg-[#282828] rounded-xl p-4">
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

        {users.length === 0 && !tableLoading && !message ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              Tidak ada data mahasiswa
            </div>
            <div className="text-sm text-gray-400">
              {keyword
                ? `Tidak ditemukan hasil untuk "${keyword}"`
                : "Belum ada data untuk prodi ini"}
            </div>
          </div>
        ) : (
          <>
            <table className="table-auto w-full text-left text-black-100">
              <thead>
                <tr className="text-sm dark:text-white">
                  <th className="px-4 py-2 border-b border-gray-300 dark:border-[#3f3f3f] whitespace-nowrap">
                    No
                  </th>
                  <th className="px-4 py-2 border-b border-gray-300 dark:border-[#3f3f3f] whitespace-nowrap">
                    Fullname
                  </th>
                  <th className="px-4 py-2 border-b border-gray-300 dark:border-[#3f3f3f] whitespace-nowrap">
                    Username
                  </th>
                  <th className="px-4 py-2 border-b border-gray-300 dark:border-[#3f3f3f] whitespace-nowrap">
                    Prodi
                  </th>
                  <th className="px-4 py-2 border-b border-gray-300 dark:border-[#3f3f3f] whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#3f3f3f]">
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="text-sm dark:text-white hover:bg-gray-50 dark:hover:bg-[#333333]"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {page * limit + index + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {user.fullname || "_"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {user.prodi}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {user.prodi === "D3 Administrasi Bisnis" ? (
                        <span className="px-2 py-1 text-xs text-orange-600 border border-orange-600 rounded-lg">
                          D3 Administrasi Bisnis
                        </span>
                      ) : user.prodi === "D3 Manajemen Pemasaran" ? (
                        <span className="px-2 py-1 text-xs text-green-600 border border-green-600 rounded-lg">
                          D3 Manajemen Pemasaran
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs text-blue-600 border border-blue-600 rounded-lg">
                          D4 Manajemen Bisnis
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <ButtonAction
                          to={`/users/edit/${user.id}/mahasiswa`}
                          icon={<MdEditSquare />}
                          className={"bg-blue-600 hover:bg-blue-700"}
                          tooltip="Edit"
                        />
                        <ButtonAction
                          to={`/users/details/${user.id}/mahasiswa`}
                          icon={<BiSolidUserDetail />}
                          className={"bg-teal-600 hover:bg-teal-700"}
                          tooltip="Detail"
                        />
                        <ButtonAction
                          onClick={() => handleReset(user.id)}
                          icon={<GrPowerReset />}
                          className={"bg-green-600 hover:bg-green-700"}
                          tooltip="Reset Password"
                        />
                        <ButtonAction
                          onClick={() => deleteUser(user.id)}
                          icon={<MdDelete />}
                          className={"bg-red-600 hover:bg-red-700"}
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
            Show {Math.min(limit, users.length)} dari {rows} data
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
