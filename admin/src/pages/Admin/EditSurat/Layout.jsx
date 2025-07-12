import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../../config";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

const jenisSuratOptions = ["masuk", "keluar"];

const Layout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    jenis_surat: "masuk",
    perihal: "",
    tanggal_surat: new Date().toISOString().split("T")[0],
    asal_tujuan: "",
    user_id: "",
  });
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [surat, setSurat] = useState(null);

  useEffect(() => {
    const fetchSurat = async () => {
      try {
        const response = await axios.get(`${API_URL}/surat/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = response.data;
        setSurat(data);
        setFormData({
          jenis_surat: data.jenis_surat,
          perihal: data.perihal,
          tanggal_surat: data.tanggal_surat.split("T")[0],
          asal_tujuan: data.asal_tujuan,
          user_id: data.user_id,
        });
        setUserLoading(false);
      } catch (error) {
        console.log(error);
        setMsg("Gagal memuat data surat");
        setUserLoading(false);
      }
    };

    fetchSurat();
  }, [id, user.token]);

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
      }

      await axios.put(`${API_URL}/surat/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Surat berhasil diperbarui",
      });

      navigate(`/surat/${id}`);
    } catch (error) {
      let errorMsg = "Terjadi kesalahan saat menyimpan surat";
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

  if (userLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!surat) {
    return <div className="text-center py-10">{msg || "Surat tidak ditemukan"}</div>;
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-black-100 dark:text-white mb-4">
        Edit Surat
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
                File Surat
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                accept=".pdf,.doc,.docx,image/*"
              />
              <p className="text-xs text-gray-500 mt-1">
                Kosongkan jika tidak ingin mengubah file. Format yang didukung: PDF, DOC, DOCX, JPG, PNG (Maks. 5MB)
              </p>
              {surat.file_path && (
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>File saat ini: {surat.file_path.split("/").pop()}</span>
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
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

            <button
              type="button"
              onClick={() => navigate(`/surat/${id}`)}
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