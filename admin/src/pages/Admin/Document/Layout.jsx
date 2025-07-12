import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../../config";
import Swal from "sweetalert2";
import Button from "../../../components/ui/Button";
import ButtonAction from "../../../components/ui/ButtonAction";
import { RiApps2AddFill } from "react-icons/ri";
import {
  MdDelete,
  MdSearch,
  MdKeyboardArrowDown,
  MdDownload,
} from "react-icons/md";
import ReactPaginate from "react-paginate";
import { FaFilePdf } from "react-icons/fa";

const Layout = () => {
  const [documents, setDocuments] = useState([]);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
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
    // Hanya panggil getDocument jika authUser sudah tersedia
    if (authUser) {
      getDocument();
    }
  }, [page, keyword, limit, category, authUser]);

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

  const getDocument = async () => {
    setTableLoading(true);
    setMessage("");

    try {
      const res = await axios.get(`${API_URL}/document`, {
        params: {
          search: keyword,
          page: page,
          limit: limit,
          category: category,
        },
      });

      // Jika tidak ada data yang ditemukan
      if (!res.data || !res.data.result || res.data.result.length === 0) {
        setMessage("Tidak ada data yang ditemukan");
        setDocuments([]);
        setPages(0);
        setRows(0);
        return;
      }

      const resultData = res.data.result;
      const totalPage = res.data.totalPage || 0;
      const totalRows = res.data.totalRows || 0;
      const currentPage = res.data.page || 0;

      setDocuments(resultData);
      setPages(totalPage);
      setRows(totalRows);
      setPage(currentPage);
      setInitialLoad(false); // Set initialLoad ke false setelah data dimuat
    } catch (error) {
      console.error("Error fetching data", error);

      setDocuments([]);
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

  const handleDownload = async (id) => {
    try {
      // Cari dokumen yang sesuai
      const doc = documents.find((item) => item.id === id);
      if (!doc) throw new Error("Dokumen tidak ditemukan");

      const response = await axios.get(`${API_URL}/document/download/${id}`, {
        responseType: "blob",
      });

      // Buat URL objek dari blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Buat elemen link untuk download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.file_name); // Gunakan nama file asli
      document.body.appendChild(link);

      // Trigger download
      link.click();

      // Bersihkan memori
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      Swal.fire(
        "Gagal Mengunduh",
        error.response?.data?.message ||
          "Anda tidak memiliki izin untuk mengunduh dokumen ini",
        "error"
      );
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

  const deleteDocument = async (id) => {
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
          await axios.delete(`${API_URL}/document/${id}`);
          getDocument();
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

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (ext === "pdf") return <FaFilePdf className="text-red-500 text-xl" />;
    if (["doc", "docx"].includes(ext))
      return <FaFileWord className="text-blue-500 text-xl" />;
    return <FaFilePdf className="text-gray-500 text-xl" />;
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
        Pengelolaan Documents
      </h2>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex gap-2">
          <Button
            text="Upload Doc Baru"
            to="/upload/document"
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
                className="px-4 py-3 border dark:text-white border-gray-300 dark:border-[#3f3f3f] rounded-md text-sm appearance-none pr-7 focus:outline-none bg-white dark:bg-[#282828]"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={tableLoading}
              >
                <option value="">Semua Kategori</option>
                <option value="SOP">SOP</option>
                <option value="Form Pengajuan">Form Pengajuan</option>
                <option value="Laporan">Laporan</option>
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
                placeholder="Cari document"
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

        {documents.length === 0 && !tableLoading && !message ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              Tidak ada data dokumen
            </div>
            <div className="text-sm text-gray-400">
              {keyword
                ? `Tidak ditemukan hasil untuk "${keyword}"`
                : "Belum ada data dokumen"}
            </div>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-300 dark:divide-[#3f3f3f]">
              <thead>
                <tr className="text-sm dark:text-white">
                  <th className="px-4 py-3 text-left font-medium">No</th>
                  <th className="px-4 py-3 text-left font-medium">Document</th>
                  <th className="px-4 py-3 text-left font-medium">Kategori</th>
                  <th className="px-4 py-3 text-left font-medium">Hak Akses</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Tanggal Upload
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#3f3f3f]">
                {documents.map((doc, index) => (
                  <tr
                    key={doc.id}
                    className="text-sm dark:text-white hover:bg-gray-50 dark:hover:bg-[#333333]"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {page * limit + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {getFileIcon(doc.file_name)}
                        <div className="ml-2">
                          <div className="font-medium">{doc.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {doc.file_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {doc.access_roles.split(",").map((role, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-full"
                          >
                            {role.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(doc.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <ButtonAction
                          onClick={() => handleDownload(doc.id)}
                          icon={<MdDownload size={16} />}
                          className="bg-green-600 hover:bg-green-700"
                          tooltip="Download"
                        />
                        <ButtonAction
                          onClick={() => deleteDocument(doc.id)}
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
            Show {Math.min(limit, documents.length)} dari {rows} data
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
