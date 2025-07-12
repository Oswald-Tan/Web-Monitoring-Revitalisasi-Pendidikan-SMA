import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const jenisSuratOptions = ["masuk", "keluar"];

const Layout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    jenis_surat: "masuk",
    perihal: "",
    tanggal_surat: new Date().toISOString().split("T")[0],
    asal_tujuan: "",
    user_id: "", // Kosongkan dulu
  });
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (user) {
      setUserLoading(false);
      setFormData((prev) => ({
        ...prev,
        user_id: user.id,
      }));
    } else {
      // Jika user tidak tersedia setelah beberapa saat, mungkin belum login
      const timer = setTimeout(() => {
        if (!user) {
          setUserLoading(false);
          setMsg("User tidak tersedia, silakan login kembali");
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_id) {
      setMsg("User ID tidak valid, silakan login kembali");
      return;
    }

    setMsg("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("jenis_surat", formData.jenis_surat);
      formDataToSend.append("perihal", formData.perihal);
      formDataToSend.append("tanggal_surat", formData.tanggal_surat);
      formDataToSend.append("asal_tujuan", formData.asal_tujuan);
      formDataToSend.append("user_id", formData.user_id);

      if (file) {
        formDataToSend.append("file", file);
      } else {
        throw new Error("File wajib diunggah");
      }

      await axios.post(`${API_URL}/surat`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Surat berhasil disimpan",
      });

      navigate("/surat/list");
    } catch (error) {
      let errorMsg = "Terjadi kesalahan saat menyimpan surat";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      setMsg(errorMsg);

      // setMsg(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-black-100 dark:text-white mb-4">
        Tambah Surat Baru
      </h1>

      <div className="mt-5 overflow-x-auto bg-white dark:bg-[#282828] rounded-xl p-4 shadow-md relative">
        {msg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium dark:text-white mb-1">
                Jenis Surat <span className="text-red-500">*</span>
              </label>
              <select
                name="jenis_surat"
                value={formData.jenis_surat}
                onChange={handleChange}
               className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              >
                <option value="">Pilih Jenis Surat</option>
                {jenisSuratOptions.map((jenis_surat, index) => (
                  <option key={index} value={jenis_surat}>
                    {jenis_surat.charAt(0).toUpperCase() + jenis_surat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium dark:text-white mb-1">
                Perihal <span className="text-red-500">*</span>
              </label>
              <textarea
                name="perihal"
                value={formData.perihal}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Tanggal Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggal_surat"
                value={formData.tanggal_surat}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Asal/Tujuan
              </label>
              <input
                type="text"
                name="asal_tujuan"
                value={formData.asal_tujuan}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium dark:text-white mb-1">
                File Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                accept=".pdf,.doc,.docx,image/*"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Format yang didukung: PDF, DOC, DOCX, JPG, PNG (Maks. 5MB)
              </p>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Menyimpan..." : "Simpan Surat"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/surat")}
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
