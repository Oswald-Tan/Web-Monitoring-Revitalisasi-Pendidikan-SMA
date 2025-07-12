import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import { useParams } from "react-router-dom";
import Button from "../../../components/ui/Button";
import { RiApps2AddFill, RiEdit2Fill } from "react-icons/ri";

const Layout = () => {
  const { id } = useParams();
  const [dosenDetails, setDosenDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Akses data detail dari array pertama (jika ada)
  const detailData = dosenDetails?.detaildosens?.[0] || {};

  useEffect(() => {
    const getDosenDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/dosen/detail/${id}/details`);

        if (!res.data || !res.data.result) {
          setError("Data dosen tidak ditemukan");
        } else {
          setDosenDetails(res.data.result);

          // Periksa apakah ada data detail
          if (
            res.data.result.detaildosens &&
            res.data.result.detaildosens.length > 0
          ) {
            setError(null);
          } else {
            setError("Detail dosen belum tersedia");
          }
        }

        console.log(res.data);
      } catch (error) {
        if (error.response?.status === 404) {
          setError("Data dosen tidak ditemukan");
        } else {
          setError(error.message || "Terjadi kesalahan saat memuat data");
        }
      } finally {
        setLoading(false);
      }
    };
    getDosenDetail();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">
          Detail Dosen
        </h2>

        {error && !dosenDetails ? (
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
                    NIP
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Pendidikan Terakhir
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Tahun
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Golongan
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    TMT Golongan
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    TMT Jabatan
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Jabatan
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Agama
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    Foto
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-sm dark:text-white">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {dosenDetails?.fullname || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {/* Akses email dari objek User */}
                    {dosenDetails?.User?.email || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {dosenDetails?.nip || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {detailData.pendidikanTerakhir || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {detailData.tahun || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {detailData.gol || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {detailData.tmtGolongan || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {detailData.tmtJabatan || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {detailData.jabatan || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {detailData.agama || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {/* Akses properti 'foto' (bukan 'photo_profile') */}
                    {dosenDetails?.foto || "-"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Tampilkan pesan jika detail tidak ada */}
            {error && dosenDetails && (
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
