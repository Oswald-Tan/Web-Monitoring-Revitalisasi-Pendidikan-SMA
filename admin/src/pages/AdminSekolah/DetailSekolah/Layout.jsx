import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL, API_URL_STATIC } from "../../../config";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

const Layout = () => {
  // State untuk data sekolah
  const { id } = useParams();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rabItems, setRabItems] = useState([]);

  // Fetch school detail on component mount
  useEffect(() => {
    const fetchSchoolDetail = async () => {
      try {
        const res = await axios.get(`${API_URL}/school-details/${id}`);
        const backendData = res.data.data;

        // Pastikan issues adalah array object
        const issues = Array.isArray(backendData.catatan_masalah)
          ? backendData.catatan_masalah
          : [];

        // Format data sesuai kebutuhan komponen
        const formattedData = {
          ...backendData.school,
          issues: issues,
          recommendations: backendData.rekomendasi || "",
          photos: backendData.foto_progress || [],
          dedRab: backendData.ded_path,
        };

        setSchool(formattedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSchoolDetail();
  }, [id]);

  // Fungsi untuk mengambil data RAB
  const fetchRabData = async () => {
    try {
      const res = await axios.get(`${API_URL}/rab-items/school/${id}`);
      if (res.data.success) {
        setRabItems(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching RAB data:", error);
    }
  };

  // Panggil fetchRabData saat komponen dimuat
  useEffect(() => {
    if (id) {
      fetchRabData();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!school) {
    return <div>Data sekolah tidak ditemukan</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Detail Sekolah: {school.name}
        </h2>
        <div className="text-sm text-gray-500">
          Lokasi: {school.location} | Fasilitator: {school.facilitator?.name}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            <h3 className="text-lg font-semibold mb-4">Progress</h3>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-4 mr-4">
                <div
                  className="bg-blue-600 h-4 rounded-full"
                  style={{ width: `${school.progress}%` }}
                ></div>
              </div>
              <span className="text-lg font-bold text-gray-800">
                {school.progress}%
              </span>
            </div>
          </div>

          {/* Issues */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Catatan Masalah</h3>
            </div>

            <div className="space-y-4">
              {(school.issues || []).map((issue) => (
                <div
                  key={issue.id}
                  className={`p-3 rounded-lg ${
                    issue.resolved ? "bg-green-50" : "bg-yellow-50"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full mt-1.5 ${
                        issue.resolved ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {issue.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        Tanggal: {issue.date} | Status:{" "}
                        {issue.resolved ? "Selesai" : "Belum Selesai"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Rekomendasi</h3>
            </div>
            <p className="text-gray-700">{school.recommendations}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* DED/RAB */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            <h3 className="text-lg font-semibold mb-4">RAB</h3>
            
            {/* Tampilkan data RAB jika ada */}
            {rabItems.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  Data RAB:
                </h4>
                <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                  {rabItems.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className="text-sm text-gray-600 py-1 border-b"
                    >
                      <span className="font-medium">{item.itemNo}</span> -{" "}
                      {item.uraian}
                      <span className="ml-2 text-blue-600">
                        ({item.volume} {item.satuan})
                      </span>
                    </div>
                  ))}
                  {rabItems.length > 5 && (
                    <div className="text-sm text-gray-500 py-1 text-center">
                      ... dan {rabItems.length - 5} item lainnya
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Photo Gallery */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Galeri Foto Progres</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(school.photos || []).map((photo) => (
                <div
                  key={photo.id}
                  className="border border-gray-300 rounded-lg overflow-hidden"
                >
                  <img
                    src={`${API_URL_STATIC}/school-progress/${photo.filename}`}
                    alt={photo.caption}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-2">
                    <p className="text-sm text-gray-600">
                      Progress {photo.milestone}% - {photo.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;