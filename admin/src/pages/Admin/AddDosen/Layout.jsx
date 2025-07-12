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
    nip: "",
    nidn: "",
    jenisKelamin: "",
    tempatLahir: "",
    tglLahir: "",
    karpeg: "",
    cpns: "",
    pns: "",
    jurusan: "",
    prodi: "",
    pendidikanTerakhir: "",
    tahun: "",
    gol: "",
    tmtGolongan: "",
    tmtJabatan: "",
    jabatan: "",
    agama: "",
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
      await axios.post(`${API_URL}/dosen`, {
        fullname: formData.fullname,
        email: formData.email,
        phone_number: formData.phone_number,
        nip: formData.nip,
        nidn: formData.nidn,
        username: formData.nip, // Ditambahkan
        jenisKelamin: formData.jenisKelamin,
        tempatLahir: formData.tempatLahir,
        tglLahir: formData.tglLahir,
        karpeg: formData.karpeg,
        cpns: formData.cpns,
        pns: formData.pns,
        jurusan: formData.jurusan,
        prodi: formData.prodi,
        pendidikanTerakhir: formData.pendidikanTerakhir,
        tahun: formData.tahun,
        gol: formData.gol,
        tmtGolongan: formData.tmtGolongan,
        tmtJabatan: formData.tmtJabatan,
        jabatan: formData.jabatan,
        agama: formData.agama,
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Dosen berhasil ditambahkan",
      });
      navigate("/users/all/dosen");
    } catch (error) {
      // Tangani error dengan lebih baik
      let errorMsg = "Terjadi kesalahan";

      if (error.response) {
        // Server merespon dengan status code di luar 2xx
        errorMsg =
          error.response.data.message ||
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
        Tambah Dosen
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
                NIP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nip"
                value={formData.nip}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                NIDN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nidn"
                value={formData.nidn}
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
                Tempat Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tempatLahir"
                value={formData.tempatLahir}
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
                Karpeg <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="karpeg"
                value={formData.karpeg}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                required
              />
            </div>

             <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                CPNS 
              </label>
              <input
                type="text"
                name="cpns"
                value={formData.cpns}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
              />
            </div>

             <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                PNS 
              </label>
              <input
                type="text"
                name="pns"
                value={formData.pns}
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
                Program Studi <span className="text-red-500">*</span>
              </label>
              <select
                name="prodi"
                value={formData.prodi}
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
                Pendidikan Terakhir
              </label>
              <input
                type="text"
                name="pendidikanTerakhir"
                value={formData.pendidikanTerakhir}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Tahun
              </label>
              <input
                type="text"
                name="tahun"
                value={formData.tahun}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Golongan
              </label>
              <input
                type="text"
                name="gol"
                value={formData.gol}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                TMT Golongan
              </label>
              <input
                type="date"
                name="tmtGolongan"
                value={formData.tmtGolongan}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
              />
            </div>

              <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                TMT Jabatan
              </label>
              <input
                type="date"
                name="tmtJabatan"
                value={formData.tmtJabatan}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Jabatan
              </label>
              <input
                type="text"
                name="jabatan"
                value={formData.jabatan}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
              />
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
