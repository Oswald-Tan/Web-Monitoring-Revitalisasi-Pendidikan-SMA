import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config";
import Swal from "sweetalert2";

const jenisOptions = ["surat", "kegiatan", "pengajuan"];
const statusOptions = ["draft", "diterima", "ditolak", "selesai"];

const Layout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    judul: "",
    jenis: "",
    deskripsi: "",
    nomor_dokumen: "",
    tanggal: new Date().toISOString().split("T")[0],
    pihak_terkait: "",
    status: "draft",
    file: null,
    meta_kategori: "",
    meta_penulis: "",
    meta_departemen: "",
    meta_tahun: "",
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("judul", formData.judul);
      formDataToSend.append("jenis", formData.jenis);
      formDataToSend.append("deskripsi", formData.deskripsi);
      formDataToSend.append("nomor_dokumen", formData.nomor_dokumen);
      formDataToSend.append("tanggal", formData.tanggal);
      formDataToSend.append("pihak_terkait", formData.pihak_terkait);
      formDataToSend.append("status", formData.status);

      formDataToSend.append("meta_kategori", formData.meta_kategori);
      formDataToSend.append("meta_penulis", formData.meta_penulis);
      formDataToSend.append("meta_departemen", formData.meta_departemen);
      formDataToSend.append("meta_tahun", formData.meta_tahun);

      if (formData.file) {
        formDataToSend.append("file", formData.file);
      } else {
        throw new Error("File arsip wajib diisi");
      }

      await axios.post(`${API_URL}/arsip`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Arsip berhasil disimpan",
      });

      navigate("/arsip/list");
    } catch (error) {
      let errorMsg = "Terjadi kesalahan saat menyimpan arsip";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      setMsg(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-black-100 dark:text-white mb-4">
        Tambah Arsip
      </h1>

      <div className="mt-5 overflow-x-auto bg-white dark:bg-[#282828] rounded-xl p-4 shadow-md relative">
        {msg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Judul Dokumen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="judul"
                value={formData.judul}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Jenis <span className="text-red-500">*</span>
              </label>
              <select
                name="jenis"
                value={formData.jenis}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              >
                <option value="">Pilih Jenis</option>
                {jenisOptions.map((jenis, index) => (
                  <option key={index} value={jenis}>
                    {jenis.charAt(0).toUpperCase() + jenis.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium dark:text-white mb-1">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Nomor Dokumen
              </label>
              <input
                type="text"
                name="nomor_dokumen"
                value={formData.nomor_dokumen}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Pihak Terkait
              </label>
              <input
                type="text"
                name="pihak_terkait"
                value={formData.pihak_terkait}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              >
                {statusOptions.map((status, index) => (
                  <option key={index} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium dark:text-white mb-1">
                Pilih File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="file"
                onChange={handleFileChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                required
              />

              {previewUrl && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-1">Preview:</p>
                  <iframe
                    src={previewUrl}
                    className="w-full h-98 border rounded-md"
                    title="File preview"
                  />
                </div>
              )}
            </div>

            {/* Di file form frontend */}
            <div className="md:col-span-2 border border-gray-300 dark:border-[#575757] rounded-md p-4">
              <h3 className="text-sm font-medium dark:text-white mb-3">
                Metadata
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                    Kategori
                  </label>
                  <input
                    type="text"
                    name="meta_kategori"
                    value={formData.meta_kategori || ""}
                    onChange={handleChange}
                    placeholder="Misal: Penting"
                    className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                    Penulis
                  </label>
                  <input
                    type="text"
                    name="meta_penulis"
                    value={formData.meta_penulis || ""}
                    onChange={handleChange}
                    placeholder="Misal: Admin"
                    className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                    Departemen
                  </label>
                  <input
                    type="text"
                    name="meta_departemen"
                    value={formData.meta_departemen || ""}
                    onChange={handleChange}
                    placeholder="Misal: HRD"
                    className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                    Tahun Berlaku
                  </label>
                  <input
                    type="number"
                    name="meta_tahun"
                    value={formData.meta_tahun || ""}
                    onChange={handleChange}
                    placeholder="Misal: 2024"
                    min="2000"
                    max="2100"
                    className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Menyimpan..." : "Simpan Arsip"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/arsip/list")}
              className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 text-sm font-semibold rounded-md shadow hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Layout;
