import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config";
import Swal from "sweetalert2";

const prodiOptions = [
  "D3 Administrasi Bisnis",
  "D3 Manajemen Pemasaran",
  "D4 Manajemen Bisnis",
];

const jurusanOptions = ["Administrasi Bisnis"];
const agamaOptions = [
  "Kristen Protestan",
  "Islam",
  "Khatolik",
  "Hindu",
  "Budha",
  "Konghucu",
];

const Layout = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone_number: "",
    nim: "",
    jenisKelamin: "",
    kotaLahir: "",
    tglLahir: "",
    agama: "",
    alamatTerakhir: "",
    kota: "",
    kodePos: "",
    angkatan: "",
    noTestMasuk: "",
    tglTerdaftar: "",
    statusMasukPt: "",
    jurusan: "",
    prodiAdmin: "",
  });

  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveUser = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      await axios.post(`${API_URL}/mahasiswa`, {
        fullname: formData.fullname,
        email: formData.email,
        phone_number: formData.phone_number,
        nim: formData.nim,
        username: formData.nim, // Ditambahkan
        jenisKelamin: formData.jenisKelamin,
        kotaLahir: formData.kotaLahir,
        tglLahir: formData.tglLahir,
        agama: formData.agama,
        alamatTerakhir: formData.alamatTerakhir,
        kota: formData.kota,
        kodePos: formData.kodePos,
        angkatan: formData.angkatan,
        noTestMasuk: formData.noTestMasuk,
        tglTerdaftar: formData.tglTerdaftar,
        statusMasukPt: formData.statusMasukPt,
        jurusan: formData.jurusan,
        prodi: formData.prodiAdmin,
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Mahasiswa berhasil ditambahkan",
      });
      navigate("/users/all/mahasiswa");
    } catch (error) {
    // Tangani error dengan lebih baik
    let errorMsg = "Terjadi kesalahan";
    
    if (error.response) {
      // Server merespon dengan status code di luar 2xx
      errorMsg = error.response.data.message || 
                 error.response.data.error || 
                 `Error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      // Request dibuat tapi tidak ada response
      errorMsg = "Tidak ada respons dari server";
    }
    
    setMsg(errorMsg);
    console.error("API Error:", error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-black-100 dark:text-white mb-4">
        Tambah Mahasiswa
      </h1>

      <div className="mt-5 overflow-x-auto bg-white dark:bg-[#282828] rounded-xl p-4 shadow-md relative">
        {msg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {msg}
          </div>
        )}

        <form onSubmit={saveUser}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Fullname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Nomor HP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                placeholder="Contoh: 08123456789 atau +628123456789"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                NIM <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nim"
                value={formData.nim}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                name="jenisKelamin"
                value={formData.jenisKelamin}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              >
                <option value="">...</option>
                <option value="L">L</option>
                <option value="P">P</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Kota Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="kotaLahir"
                value={formData.kotaLahir}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tglLahir"
                value={formData.tglLahir}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Program Studi <span className="text-red-500">*</span>
              </label>
              <select
                name="prodiAdmin"
                value={formData.prodiAdmin}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              >
                <option value="">Pilih Program Studi</option>
                {prodiOptions.map((prodi, index) => (
                  <option key={index} value={prodi}>
                    {prodi}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Alamat Terakhir
              </label>
              <input
                type="text"
                name="alamatTerakhir"
                value={formData.alamatTerakhir}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Kota
              </label>
              <input
                type="text"
                name="kota"
                value={formData.kota}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Kode Pos
              </label>
              <input
                type="text"
                name="kodePos"
                value={formData.kodePos}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Angkatan
              </label>
              <input
                type="text"
                name="angkatan"
                value={formData.angkatan}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                No Test Masuk
              </label>
              <input
                type="text"
                name="noTestMasuk"
                value={formData.noTestMasuk}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Tanggal Terdaftar
              </label>
              <input
                type="date"
                name="tglTerdaftar"
                value={formData.tglTerdaftar}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Status Masuk PT
              </label>
              <input
                type="text"
                name="statusMasukPt"
                value={formData.statusMasukPt}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Jurusan <span className="text-red-500">*</span>
              </label>
              <select
                name="jurusan"
                value={formData.jurusan}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              >
                <option value="">Pilih Jurusan</option>
                {jurusanOptions.map((jurusan, index) => (
                  <option key={index} value={jurusan}>
                    {jurusan}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Agama <span className="text-red-500">*</span>
              </label>
              <select
                name="agama"
                value={formData.agama}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              >
                <option value="">Pilih Agama</option>
                {agamaOptions.map((agama, index) => (
                  <option key={index} value={agama}>
                    {agama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {loading ? "Loading..." : "Simpan"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/mahasiswa")}
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
