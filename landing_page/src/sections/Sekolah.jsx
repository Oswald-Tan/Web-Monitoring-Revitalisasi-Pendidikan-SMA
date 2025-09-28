// components/Sekolah.js
import React, { useState, useEffect } from "react";
import { MapPin, School, Filter, Loader, Image } from "lucide-react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { API_URL, API_URL_STATIC } from "../config";


const Sekolah = () => {
  const [selectedKabupaten, setSelectedKabupaten] = useState("semua");
  const [schools, setSchools] = useState([]);
  const [kabupatenList, setKabupatenList] = useState(["semua"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  
  // State untuk galeri
  const [galleryData, setGalleryData] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryPage, setGalleryPage] = useState(0);
  const [galleryLimit] = useState(9);
  const [galleryPages, setGalleryPages] = useState(0);

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const changeGalleryPage = ({ selected }) => {
    setGalleryPage(selected);
  };

  // Fetch data sekolah
  const fetchSchools = async (kabupaten = "", currentPage = page) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: limit
      };
      
      if (kabupaten && kabupaten !== "semua") {
        params.kabupaten = kabupaten;
      }

      const res = await axios.get(`${API_URL}/schools/school-lp`, { params });
      
      if (res.data) {
        setSchools(res.data.data || []);
        setPages(res.data.totalPage || 0);
        setRows(res.data.totalRows || 0);
      } else {
        console.error("Invalid response structure", res);
        setSchools([]);
        setPages(0);
        setRows(0);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Gagal mengambil data sekolah";
      setError(errorMessage);
      console.error("Error fetching schools:", err);
      setSchools([]);
      setPages(0);
      setRows(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data galeri
  const fetchGalleryData = async (currentPage = galleryPage) => {
    try {
      setGalleryLoading(true);
      
      const res = await axios.get(`${API_URL}/schools/gallery`, {
        params: {
          page: currentPage,
          limit: galleryLimit
        }
      });

      console.log('Gallery API Response:', res.data);
      
      if (res.data) {
        setGalleryData(res.data.data || []);
        setGalleryPages(res.data.totalPage || 0);
         // Debug setiap URL gambar
        res.data.data.forEach(school => {
          school.photos.forEach(photo => {
            console.log(`Image URL for ${school.schoolName}:`, `${API_URL_STATIC}/school-progress/${photo.filename}`);
          });
        });
      } else {
        setGalleryData([]);
        setGalleryPages(0);
      }
    } catch (err) {
      console.error("Error fetching gallery data:", err);
      setGalleryData([]);
      setGalleryPages(0);
    } finally {
      setGalleryLoading(false);
    }
  };

  // Fetch daftar kabupaten
  const fetchKabupatenList = async () => {
    try {
      const response = await axios.get(`${API_URL}/schools/kabupaten-list`);
      setKabupatenList(["semua", ...response.data]);
    } catch (err) {
      console.error("Error fetching kabupaten list:", err);
      setKabupatenList(["semua"]);
    }
  };

  useEffect(() => {
    fetchKabupatenList();
    fetchGalleryData();
  }, []);

  useEffect(() => {
    fetchSchools(selectedKabupaten, page);
  }, [selectedKabupaten, page, limit]);

  useEffect(() => {
    fetchGalleryData(galleryPage);
  }, [galleryPage]);

  const handleKabupatenChange = (e) => {
    setSelectedKabupaten(e.target.value);
    setPage(0);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "on-track":
        return { color: "hijau", text: "On Track" };
      case "delayed":
        return { color: "merah", text: "Delayed" };
      case "in-progress":
        return { color: "kuning", text: "In Progress" };
      default:
        return { color: "kuning", text: "In Progress" };
    }
  };

  const getPhotoTypeInfo = (milestone) => {
    if (milestone === 0) return { type: "Before", color: "red" };
    if (milestone === 100) return { type: "After", color: "green" };
    return { type: `Progress ${milestone}%`, color: "yellow" };
  };

  if (loading) {
    return (
      <section id="sekolah" className="py-20 bg-gray-50">
        <div className="container mx-auto md:w-10/11 w-11/12 flex justify-center items-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Memuat data sekolah...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="sekolah" className="py-20 bg-gray-50">
        <div className="container mx-auto md:w-10/11 w-11/12 text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error: </strong> {error}
          </div>
          <button
            onClick={() => fetchSchools(selectedKabupaten, page)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="sekolah" className="py-20 bg-gray-50">
      <div className="container mx-auto md:w-10/11 w-11/12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Sekolah Sasaran
          </h2>
          <p className="text-xl text-gray-600">
            {rows} sekolah telah dipilih untuk mendapatkan program revitalisasi infrastruktur
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">
              Filter by Kabupaten:
            </span>
            <select
              value={selectedKabupaten}
              onChange={handleKabupatenChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {kabupatenList.map((kabupaten) => (
                <option key={kabupaten} value={kabupaten}>
                  {kabupaten === "semua" ? "Semua Kabupaten" : kabupaten}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabel Sekolah */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {schools.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data sekolah yang ditemukan
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Sekolah
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kabupaten
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lokasi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fasilitator
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schools.map((school) => {
                    const statusInfo = getStatusInfo(school.status);
                    return (
                      <tr key={school.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <School className="w-5 h-5 text-gray-400 mr-3" />
                            <div className="font-medium text-gray-900">
                              {school.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {school.kabupaten}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">
                              {school.location}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                              <div
                                className={`h-2 rounded-full ${
                                  school.progress >= 80
                                    ? "bg-green-600"
                                    : school.progress >= 60
                                    ? "bg-yellow-600"
                                    : "bg-red-600"
                                }`}
                                style={{ width: `${school.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {school.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {school.facilitator_name || "Belum ada fasilitator"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              statusInfo.color === "hijau"
                                ? "bg-green-100 text-green-800"
                                : statusInfo.color === "kuning"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {statusInfo.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-medium">
                Menampilkan {page * limit + 1} sampai{" "}
                {Math.min((page + 1) * limit, rows)} dari {rows} sekolah
              </span>
              <span className="text-gray-400">•</span>
              <span>
                Halaman {page + 1} dari {pages}
              </span>
            </div>

            <nav>
              <ReactPaginate
                previousLabel="← Sebelumnya"
                nextLabel="Berikutnya →"
                pageCount={pages}
                onPageChange={changePage}
                forcePage={page}
                containerClassName="flex items-center gap-1"
                pageLinkClassName="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                previousLinkClassName="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                nextLinkClassName="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                activeLinkClassName="!bg-blue-500 !text-white !border-blue-500"
                disabledLinkClassName="opacity-50 cursor-not-allowed"
                breakLabel="..."
                breakClassName="px-3 py-2"
              />
            </nav>
          </div>
        )}

        {/* Galeri Dokumentasi */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Galeri Dokumentasi
          </h3>
          
          {galleryLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Memuat galeri...</span>
            </div>
          ) : galleryData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data galeri dokumentasi
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryData.flatMap(school =>
                  school.photos.map(photo => {
                    const photoType = getPhotoTypeInfo(photo.milestone);
                    const imageUrl = `${API_URL_STATIC}/school-progress/${photo.filename}`;
                    
                    console.log(`Rendering image: ${imageUrl}`); // DEBUG

                    return (
                      <div
                        key={`${school.schoolId}-${photo.id}`}
                        className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow"
                      >
                        <div className="aspect-video bg-gray-200 relative overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={photo.caption || `Dokumentasi ${school.schoolName}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              console.error(`Gagal memuat gambar: ${imageUrl}`); // DEBUG
                              e.target.src = `https://via.placeholder.com/400x300/EFEFEF/666666?text=Gambar+Tidak+Tersedia`;
                            }}
                            onLoad={() => console.log(`Berhasil memuat: ${imageUrl}`)} // DEBUG
                          />
                          <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 px-3 py-1 rounded-full">
                            <span
                              className={`text-xs font-medium ${
                                photoType.color === "red"
                                  ? "text-red-600"
                                  : photoType.color === "green"
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {photoType.type}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900">{school.schoolName}</h4>
                          <p className="text-sm text-gray-600">{school.kabupaten}</p>
                          {photo.caption && (
                            <p className="text-sm text-gray-700 mt-2">{photo.caption}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination Galeri */}
              {galleryPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Halaman {galleryPage + 1} dari {galleryPages}</span>
                  </div>

                  <nav>
                    <ReactPaginate
                      previousLabel="← Sebelumnya"
                      nextLabel="Berikutnya →"
                      pageCount={galleryPages}
                      onPageChange={changeGalleryPage}
                      forcePage={galleryPage}
                      containerClassName="flex items-center gap-1"
                      pageLinkClassName="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                      previousLinkClassName="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                      nextLinkClassName="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                      activeLinkClassName="!bg-blue-500 !text-white !border-blue-500"
                      disabledLinkClassName="opacity-50 cursor-not-allowed"
                      breakLabel="..."
                      breakClassName="px-3 py-2"
                    />
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Sekolah;