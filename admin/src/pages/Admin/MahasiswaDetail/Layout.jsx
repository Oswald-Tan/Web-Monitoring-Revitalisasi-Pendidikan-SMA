import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import { useParams } from "react-router-dom";
import Button from "../../../components/ui/Button";
import { RiApps2AddFill, RiEdit2Fill } from "react-icons/ri";
import ModalAdd from "./ModalAdd";

const Layout = () => {
  const { id } = useParams();
  const [mahasiswaDetails, setMahasiswaDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasDetail, setHasDetail] = useState(false); // State baru untuk cek ketersediaan data

  // Akses data detail dari array pertama (jika ada)
  const detailData = mahasiswaDetails?.detailmahasiswas?.[0] || {};

  useEffect(() => {
    const getMahasiswaDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_URL}/mahasiswa/detail/${id}/details`
        );

        if (!res.data || !res.data.result) {
          setError("Data mahasiswa tidak ditemukan");
          setHasDetail(false);
        } else {
          setMahasiswaDetails(res.data.result);

          // Periksa apakah ada data detail
          if (
            res.data.result.detailmahasiswas &&
            res.data.result.detailmahasiswas.length > 0
          ) {
            setHasDetail(true);
            setError(null);
          } else {
            setHasDetail(false);
            setError("Detail mahasiswa belum tersedia");
          }
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setError("Data mahasiswa tidak ditemukan");
          setHasDetail(false);
        } else {
          setError(error.message || "Terjadi kesalahan saat memuat data");
          setHasDetail(false);
        }
      } finally {
        setLoading(false);
      }
    };
    getMahasiswaDetail();
  }, [id]);

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ModalAdd
        isOpen={isModalOpen}
        handleClose={handleModalClose}
        mahasiswaId={id}
        detailData={hasDetail ? detailData : null}
      />

      <div>
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">
          Detail Mahasiswa
        </h2>

        <div className="mb-4">
          <div className="flex gap-2">
            <Button
              text={hasDetail ? "Edit Data" : "Lengkapi Data"} // Teks tombol dinamis
              onClick={handleAddClick}
              iconPosition="left"
              icon={hasDetail ? <RiEdit2Fill /> : <RiApps2AddFill />} // Icon dinamis
              width="min-w-[120px]"
              className={`${
                hasDetail 
                  ? "bg-yellow-500 hover:bg-yellow-600" 
                  : "bg-purple-500 hover:bg-purple-600"
              }`}
            />
          </div>
        </div>


        {error && !mahasiswaDetails ? (
          <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>
        ) : (
          <div className="mt-5 overflow-x-auto bg-white dark:bg-[#282828] rounded-xl p-4 shadow-md relative">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-[#3f3f3f]">
              <thead>
                <tr className="text-sm dark:text-white">
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Fullname
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    NIM
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Status Mahasiswa
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Tahun Tamat SMTA
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Jurusan Di SMTA
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Tanggal Ijazah SMTA
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Nilai Ujian Akhir SMTA
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Nama Orangtua Wali
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Pendapatan Orangtua Wali
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Alamat Wali
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Kota Wali
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    No Hp Wali
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Email Wali
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Foto
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-sm dark:text-white">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {mahasiswaDetails?.fullname || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {/* Akses email dari objek User */}
                    {mahasiswaDetails?.User?.email || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {mahasiswaDetails?.nim || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {detailData.statusMahasiswa || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {detailData.tahunTamatSmta || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {detailData.jurusanDiSmta || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {detailData.tglIjazahSmta || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {detailData.nilaiUjianAkhirSmta || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {detailData.namaOrtuWali || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {detailData.pendapatanOrtuWali || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {detailData.alamatWali || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {detailData.kotaWali || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {detailData.noHpWali || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {detailData.emailWali || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {/* Akses properti 'foto' (bukan 'photo_profile') */}
                    {mahasiswaDetails?.foto || "-"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Tampilkan pesan jika detail tidak ada */}
            {error && mahasiswaDetails && (
              <div className="mt-4 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Layout;
