import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import {
  Upload,
  Download,
  FileText,
  FolderOpen,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "../contexts/AuthContext";

const Layout = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    subcategory: "",
    search: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({});
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "template",
    subcategory: "",
    version: "1.0",
    file: null,
  });

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, [filters]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      Swal.fire("Error", "Pilih file terlebih dahulu", "error");
      return;
    }

    setUploading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      await axios.post(`${API_URL}/documents/upload`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Success", "Dokumen berhasil diunggah", "success");
      setShowUploadModal(false);
      setFormData({
        title: "",
        description: "",
        category: "template",
        subcategory: "",
        version: "1.0",
        file: null,
      });
      fetchDocuments();
    } catch (error) {
      console.error("Error uploading document:", error);
      Swal.fire("Error", "Gagal mengunggah dokumen", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      const response = await axios.get(
        `${API_URL}/documents/${document.id}/download`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", document.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading document:", error);
      Swal.fire("Error", "Gagal mengunduh dokumen", "error");
    }
  };

  const handleDelete = async (document) => {
    const result = await Swal.fire({
      title: "Hapus Dokumen?",
      text: `Anda yakin ingin menghapus ${document.title}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/documents/${document.id}`);
        Swal.fire("Deleted!", "Dokumen telah dihapus.", "success");
        fetchDocuments();
      } catch (error) {
        console.error("Error deleting document:", error);
        Swal.fire("Error", "Gagal menghapus dokumen", "error");
      }
    }
  };

  const getAvailableSubcategories = () => {
    if (!filters.category) return [];
    return categories
      .filter((cat) => cat.category === filters.category)
      .map((cat) => cat.subcategory)
      .filter((value, index, self) => self.indexOf(value) === index);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes("word")) return "📝";
    if (fileType.includes("excel") || fileType.includes("sheet")) return "📊";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("image")) return "🖼️";
    return "📁";
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
            Kelola Template, SOP, dan Arsip Regulasi
          </p>
        </div>

        {user?.role === "admin" && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Unggah Dokumen
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kategori</option>
              <option value="template">Template & SOP</option>
              <option value="regulasi">Arsip Regulasi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subkategori
            </label>
            <select
              value={filters.subcategory}
              onChange={(e) =>
                handleFilterChange("subcategory", e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!filters.category}
            >
              <option value="">Semua Subkategori</option>
              {getAvailableSubcategories().map((subcat) => (
                <option key={subcat} value={subcat}>
                  {subcat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Dokumen
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Cari judul atau deskripsi..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchDocuments}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Memuat dokumen...
            </p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada dokumen
            </h3>
            <p className="text-gray-600">
              {filters.search || filters.category || filters.subcategory
                ? "Tidak ada dokumen yang sesuai dengan filter Anda"
                : "Belum ada dokumen yang diunggah"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dokumen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ukuran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diunggah Oleh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 ">
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">
                          {getFileIcon(doc.file_type)}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {doc.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doc.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {doc.category === "template"
                          ? "Template & SOP"
                          : "Arsip Regulasi"}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {doc.subcategory}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(doc.file_size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.uploader?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>

                        {user?.role === "admin" && (
                          <button
                            onClick={() => handleDelete(doc)}
                            className="text-red-600 hover:text-red-900"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
          <div className="flex flex-1 justify-between items-center">
            <div>
              <p className="text-sm text-gray-700">
                Menampilkan{" "}
                <span className="font-medium">
                  {pagination.total === 0
                    ? 0
                    : (pagination.page - 1) * pagination.limit + 1}
                </span>{" "}
                -{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                </span>{" "}
                dari <span className="font-medium">{pagination.total}</span>{" "}
                dokumen
              </p>
            </div>
            <div>
              <nav
                className="inline-flex rounded-md shadow-sm space-x-2"
                aria-label="Pagination"
              >
                <button
                  onClick={() =>
                    handleFilterChange("page", pagination.page - 1)
                  }
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() =>
                    handleFilterChange("page", pagination.page + 1)
                  }
                  disabled={pagination.page === pagination.pages}
                  className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop with opacity */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
          />
          
          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 scale-100">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Unggah Dokumen Baru
                </h3>
              </div>

              <form onSubmit={handleUpload} className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Dokumen *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="template">Template & SOP</option>
                    <option value="regulasi">Arsip Regulasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subkategori
                  </label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    placeholder="Contoh: Form Supervisi, Checklist Mutu, dll."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Versi
                  </label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File *
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? "Mengunggah..." : "Unggah"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
