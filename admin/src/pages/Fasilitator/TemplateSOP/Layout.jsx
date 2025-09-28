import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import {
  Plus,
  Download,
  Search,
  Filter,
  Edit,
  Trash2,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileArchive,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import ButtonAction from "../../../components/ui/ButtonAction";
import { FaFilePdf } from "react-icons/fa";
import { MdDelete, MdKeyboardArrowDown, MdSearch } from "react-icons/md";

const Layout = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [categories, setCategories] = useState({});
  const [filters, setFilters] = useState({
    category: "",
    subCategory: "",
    search: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({});
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "template-sop",
    subCategory: "",
    version: "1.0",
    file: null,
  });

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, [filters]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`${API_URL}/documents?${params}`);
      setDocuments(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching documents:", error);
      Swal.fire("Error", "Gagal memuat dokumen", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents/categories`);
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadForm.file) {
      Swal.fire("Peringatan", "Pilih file untuk diupload", "warning");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("title", uploadForm.title);
      formData.append("description", uploadForm.description);
      formData.append("category", uploadForm.category);
      formData.append("subCategory", uploadForm.subCategory);
      formData.append("version", uploadForm.version);
      formData.append("file", uploadForm.file);

      await axios.post(`${API_URL}/documents/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Sukses", "Dokumen berhasil diupload", "success");
      setShowUploadModal(false);
      setUploadForm({
        title: "",
        description: "",
        category: "template-sop",
        subCategory: "",
        version: "1.0",
        file: null,
      });
      fetchDocuments();
    } catch (error) {
      console.error("Error uploading document:", error);
      Swal.fire("Error", "Gagal mengupload dokumen", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documentId, filename) => {
    try {
      const response = await axios.get(
        `${API_URL}/documents/download/${documentId}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading document:", error);
      Swal.fire("Error", "Gagal mengunduh dokumen", "error");
    }
  };

  const handleDelete = async (documentId) => {
    try {
      const result = await Swal.fire({
        title: "Apakah Anda yakin?",
        text: "Dokumen yang dihapus tidak dapat dikembalikan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        await axios.delete(`${API_URL}/documents/${documentId}`);

        Swal.fire("Terhapus!", "Dokumen berhasil dihapus.", "success");
        fetchDocuments();
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      Swal.fire("Error", "Gagal menghapus dokumen", "error");
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.includes("pdf")) return <FileText className="text-red-500" />;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
      return <FileSpreadsheet className="text-green-500" />;
    if (mimeType.includes("word"))
      return <FileText className="text-blue-500" />;
    if (mimeType.includes("image"))
      return <FileImage className="text-purple-500" />;
    if (mimeType.includes("video"))
      return <FileVideo className="text-orange-500" />;
    if (mimeType.includes("zip") || mimeType.includes("rar"))
      return <FileArchive className="text-yellow-500" />;
    return <FileText className="text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Manajemen Dokumen
          </h2>
          <p className="text-sm text-gray-600">
            Kelola Template & SOP dan Arsip Regulasi
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Upload Dokumen
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <div className="relative">
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value, page: 1 })
                }
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                <option value="template-sop">Template & SOP</option>
              </select>
              <MdKeyboardArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub Kategori
            </label>
            <div>
              <select
                value={filters.subCategory}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    subCategory: e.target.value,
                    page: 1,
                  })
                }
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
              >
                <option value="">Semua Sub Kategori</option>
                {filters.category &&
                  categories[filters.category]?.map((subCat) => (
                    <option key={subCat} value={subCat}>
                      {subCat}
                    </option>
                  ))}
              </select>
              <MdKeyboardArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pencarian
            </label>
            <div className="relative group">
              <input
                type="text"
                placeholder="Cari dokumen..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value, page: 1 })
                }
                className="w-64 pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:shadow-md"
              />
              <MdSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchDocuments}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        {loading ? (
          <div className="p-8 text-center">
            <p>Memuat dokumen...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Tidak ada dokumen ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                    Nama Dokumen
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                    Kategori
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                    Ukuran
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                    Diupload Oleh
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                    Tanggal
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="text-sm hover:bg-gray-50 transition-colors duration-150 group"
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {getFileIcon(doc.mimeType)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {doc.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doc.originalName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {doc.category.replace("-", " ")}
                      </div>
                      {doc.subCategory && (
                        <div className="text-sm text-gray-500">
                          {doc.subCategory}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">
                      {doc.uploader?.name}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <ButtonAction
                          icon={<FaFilePdf />}
                          onClick={() =>
                            handleDownload(doc.id, doc.originalName)
                          }
                          className={"bg-blue-500 hover:bg-blue-600"}
                          title="Download"
                        ></ButtonAction>
                        <ButtonAction
                          icon={<MdDelete />}
                          onClick={() => handleDelete(doc.id)}
                          className={"bg-red-500 hover:bg-red-600"}
                          title="Hapus"
                        ></ButtonAction>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan{" "}
                  <span className="font-medium">
                    {pagination.total === 0
                      ? 0
                      : (pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  sampai{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  dari <span className="font-medium">{pagination.total}</span>{" "}
                  hasil
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() =>
                      setFilters({ ...filters, page: pagination.page - 1 })
                    }
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>

                  {Array.from(
                    { length: Math.min(5, pagination.pages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() =>
                            setFilters({ ...filters, page: pageNum })
                          }
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.page === pageNum
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() =>
                      setFilters({ ...filters, page: pagination.page + 1 })
                    }
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Selanjutnya
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop with opacity */}
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300" />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 scale-100">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Upload Kegiatan Baru
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Judul Dokumen *
                    </label>
                    <input
                      type="text"
                      required
                      value={uploadForm.title}
                      onChange={(e) =>
                        setUploadForm({ ...uploadForm, title: e.target.value })
                      }
                      className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
                      placeholder="Masukkan judul dokumen"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) =>
                        setUploadForm({
                          ...uploadForm,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
                      placeholder="Deskripsi singkat tentang dokumen"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori *
                      </label>
                      <select
                        required
                        value={uploadForm.category}
                        onChange={(e) =>
                          setUploadForm({
                            ...uploadForm,
                            category: e.target.value,
                            subCategory: "",
                          })
                        }
                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
                      >
                        <option value="template-sop">Template & SOP</option>
                        <option value="arsip-regulasi">Arsip Regulasi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sub Kategori
                      </label>
                      <input
                        type="text"
                        value={uploadForm.subCategory}
                        onChange={(e) =>
                          setUploadForm({
                            ...uploadForm,
                            subCategory: e.target.value,
                          })
                        }
                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
                        placeholder="Misal: Form Supervisi, Checklist Mutu, dll."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Versi
                      </label>
                      <input
                        type="text"
                        value={uploadForm.version}
                        onChange={(e) =>
                          setUploadForm({
                            ...uploadForm,
                            version: e.target.value,
                          })
                        }
                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
                        placeholder="Contoh: 1.0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        File *
                      </label>
                      <input
                        type="file"
                        required
                        onChange={(e) =>
                          setUploadForm({
                            ...uploadForm,
                            file: e.target.files[0],
                          })
                        }
                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {uploading ? "Mengupload..." : "Upload Dokumen"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
