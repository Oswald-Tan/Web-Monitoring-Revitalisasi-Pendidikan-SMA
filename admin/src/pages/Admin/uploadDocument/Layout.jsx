import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config";
import Swal from "sweetalert2";

const kategoriOptions = ["SOP", "Form Pengajuan", "Laporan"];
const roleOptions = ["admin", "dosen"];

const Layout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    access_roles: "admin,dosen",
    file: null
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
      
      // Buat preview untuk file
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleRoleChange = (e) => {
    const options = e.target.options;
    const selectedRoles = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedRoles.push(options[i].value);
      }
    }
    setFormData((prev) => ({ ...prev, access_roles: selectedRoles.join(",") }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("access_roles", formData.access_roles);
      
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      } else {
        throw new Error("File dokumen wajib diisi");
      }

      // Mode buat baru
      await axios.post(`${API_URL}/document`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Dokumen berhasil diupload",
      });
      
      navigate("/documents/list");
    } catch (error) {
      let errorMsg = "Terjadi kesalahan saat mengupload dokumen";

      if (error.response) {
        errorMsg =
          error.response.data.message ||
          error.response.data.error ||
          `Error ${error.response.status}`;
      } else if (error.message) {
        errorMsg = error.message;
      }

      setMsg(errorMsg);
      console.error("API Error:", error);
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
        Upload Dokumen Baru
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
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              >
                <option value="">Pilih Kategori</option>
                {kategoriOptions.map((kategori, index) => (
                  <option key={index} value={kategori}>
                    {kategori}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium dark:text-white mb-1">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium dark:text-white mb-1">
                Hak Akses <span className="text-red-500">*</span>
              </label>
              <select
                multiple
                name="access_roles"
                value={formData.access_roles.split(",")}
                onChange={handleRoleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Tahan Ctrl/Cmd untuk memilih beberapa role
              </p>
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
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {loading ? "Loading..." : "Upload"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/documents/list")}
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