import PropTypes from "prop-types";
import { IoIosClose } from "react-icons/io";
import Swal from "sweetalert2";
import axios from "axios";
import { useState, useEffect } from "react";
import { API_URL } from "../../../config";

const statusMahasiswaOptions = ["Aktif", "Tidak Aktif", "Cuti"];

const ModalAdd = ({ mahasiswaId, detailData, isOpen, handleClose }) => {
  const [loading, setLoading] = useState(false);
  
  // Inisialisasi formValues dengan data detail jika ada
  const [formValues, setFormValues] = useState({
    statusMahasiswa: "",
    tahunTamatSmta: "",
    jurusanDiSmta: "",
    tglIjazahSmta: "",
    nilaiUjianAkhirSmta: "",
    namaOrtuWali: "",
    pendapatanOrtuWali: "",
    alamatWali: "",
    kotaWali: "",
    kodePosWali: "",
    noHpWali: "",
    emailWali: ""
  });

  // Update form values ketika detailData berubah
  useEffect(() => {
    if (detailData) {
      setFormValues({
        statusMahasiswa: detailData.statusMahasiswa || "",
        tahunTamatSmta: detailData.tahunTamatSmta || "",
        jurusanDiSmta: detailData.jurusanDiSmta || "",
        tglIjazahSmta: detailData.tglIjazahSmta ? formatDateForInput(detailData.tglIjazahSmta) : "",
        nilaiUjianAkhirSmta: detailData.nilaiUjianAkhirSmta || "",
        namaOrtuWali: detailData.namaOrtuWali || "",
        pendapatanOrtuWali: detailData.pendapatanOrtuWali || "",
        alamatWali: detailData.alamatWali || "",
        kotaWali: detailData.kotaWali || "",
        kodePosWali: detailData.kodePosWali || "",
        noHpWali: detailData.noHpWali || "",
        emailWali: detailData.emailWali || ""
      });
    } else {
      // Reset form jika tidak ada data
      setFormValues({
        statusMahasiswa: "",
        tahunTamatSmta: "",
        jurusanDiSmta: "",
        tglIjazahSmta: "",
        nilaiUjianAkhirSmta: "",
        namaOrtuWali: "",
        pendapatanOrtuWali: "",
        alamatWali: "",
        kotaWali: "",
        kodePosWali: "",
        noHpWali: "",
        emailWali: ""
      });
    }
  }, [detailData]);

  // Fungsi untuk format tanggal ke YYYY-MM-DD (format input date)
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gunakan endpoint yang sama untuk create/update
      const res = await axios.post(
        `${API_URL}/mahasiswa/add-detail?idMahasiswa=${mahasiswaId}`,
        formValues
      );

      Swal.fire({
        title: "Berhasil!",
        text: res.data.message,
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        handleClose();
        window.location.reload();
      });
      
    } catch (err) {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.message || err.message || "Terjadi kesalahan",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
      <div className="w-[80%] max-w-4xl bg-white rounded-md p-8 relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 bg-[#909090] flex items-center rounded-full text-white transition-all duration-300 ease-in-out hover:bg-[#6b6b6b]"
        >
          <IoIosClose size={28} />
        </button>
        
        <div>
          <h2 className="text-2xl font-semibold mb-6">
            {detailData ? "Edit Detail Mahasiswa" : "Tambah Detail Mahasiswa"}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Mahasiswa */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Status Mahasiswa <span className="text-red-500">*</span>
                </label>
                <select
                  name="statusMahasiswa"
                  value={formValues.statusMahasiswa}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  required
                >
                  <option value="">Pilih Status</option>
                  {statusMahasiswaOptions.map((status, index) => (
                    <option key={index} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tahun Tamat SMTA */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tahun Tamat SMTA <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="tahunTamatSmta"
                  value={formValues.tahunTamatSmta}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  required
                />
              </div>

              {/* Jurusan SMTA */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Jurusan SMTA <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="jurusanDiSmta"
                  value={formValues.jurusanDiSmta}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  required
                />
              </div>

              {/* Tanggal Ijazah SMTA */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal Ijazah SMTA <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tglIjazahSmta"
                  value={formValues.tglIjazahSmta}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  required
                />
              </div>

              {/* Nilai Ujian Akhir SMTA */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nilai Ujian Akhir SMTA <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="nilaiUjianAkhirSmta"
                  value={formValues.nilaiUjianAkhirSmta}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  required
                />
              </div>

              {/* Nama Orangtua Wali */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama Orangtua Wali <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="namaOrtuWali"
                  value={formValues.namaOrtuWali}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  required
                />
              </div>

              {/* Pendapatan Orangtua Wali */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pendapatan Orangtua Wali <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="pendapatanOrtuWali"
                  value={formValues.pendapatanOrtuWali}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  required
                />
              </div>

              {/* Alamat Wali */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Alamat Wali <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="alamatWali"
                  value={formValues.alamatWali}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  required
                />
              </div>

              {/* Kota Wali */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Kota Wali <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="kotaWali"
                  value={formValues.kotaWali}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  required
                />
              </div>

              {/* Kode Pos Wali */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Kode Pos Wali <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="kodePosWali"
                  value={formValues.kodePosWali}
                  onChange={handleChange}
                  pattern="[0-9]{5}"
                  title="Kode pos harus 5 digit angka"
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  required
                />
              </div>

              {/* No Hp Wali */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  No Hp Wali <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="noHpWali"
                  value={formValues.noHpWali}
                  onChange={handleChange}
                  pattern="[0-9]{10,15}"
                  title="Format: 08xxxxxxxxxx"
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  required
                />
              </div>

              {/* Email Wali */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Wali <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="emailWali"
                  value={formValues.emailWali}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="mr-3 px-4 py-2 border border-gray-300 text-sm font-semibold rounded-md shadow hover:bg-gray-50 focus:outline-none"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

ModalAdd.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  mahasiswaId: PropTypes.string.isRequired,
  detailData: PropTypes.object,
};

export default ModalAdd;