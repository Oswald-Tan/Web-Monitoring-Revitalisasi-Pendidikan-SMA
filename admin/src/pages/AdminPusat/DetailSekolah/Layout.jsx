import { Download, Edit, Plus, Check, X, Trash2, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL, API_URL_STATIC } from "../../../config";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import TimeScheduleChart from "../TimeSchedule/TimeScheduleChart";

const Layout = () => {
  // State untuk data sekolah
  const { id } = useParams();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk mode edit
  const [editingRecommendations, setEditingRecommendations] = useState(false);
  const [newRecommendation, setNewRecommendation] = useState("");
  const [showAddIssue, setShowAddIssue] = useState(false);
  const [newIssue, setNewIssue] = useState({ date: "", description: "" });
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ milestone: 30, caption: "" });
  const [photoFile, setPhotoFile] = useState(null);

  // State untuk upload RAB
  const [showRabUpload, setShowRabUpload] = useState(false);
  const [rabFile, setRabFile] = useState(null);
  const [uploadingRab, setUploadingRab] = useState(false);
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
        setNewRecommendation(formattedData.recommendations);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSchoolDetail();
  }, [id]);

  // Fungsi untuk menyimpan rekomendasi
  const saveRecommendations = async () => {
    try {
      await axios.patch(`${API_URL}/school-details/${id}/recommendations`, {
        recommendations: newRecommendation,
      });
      setSchool((prev) => ({ ...prev, recommendations: newRecommendation }));
      setEditingRecommendations(false);
      Swal.fire("Success", "Rekomendasi added successfully", "success");
    } catch (error) {
      console.error("Gagal menyimpan rekomendasi:", error);
      Swal.fire("Error", "Failed to save recommendations");
    }
  };

  // Fungsi untuk menambahkan catatan masalah
  const addIssue = async () => {
    try {
      const res = await axios.post(`${API_URL}/school-details/${id}/issues`, {
        date: newIssue.date,
        description: newIssue.description,
      });

      setSchool((prev) => ({
        ...prev,
        issues: [...prev.issues, res.data],
      }));
      setNewIssue({ date: "", description: "" });
      setShowAddIssue(false);
      Swal.fire("Success", "Issue added successfully", "success");
    } catch (error) {
      console.error("Gagal menambahkan masalah:", error);
      Swal.fire("Error", "Failed to add issue");
    }
  };

  // Fungsi untuk menambahkan foto milestone
  const addPhoto = async () => {
    if (!photoFile) {
      alert("Silakan pilih file foto");
      return;
    }

    const formData = new FormData();
    formData.append("photo", photoFile);
    formData.append("milestone", newPhoto.milestone);
    formData.append("caption", newPhoto.caption);

    try {
      const res = await axios.post(
        `${API_URL}/school-details/${id}/photos`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newPhotoWithUrl = {
        ...res.data,
        url: `${API_URL_STATIC}/school-progress/${res.data.filename}`,
      };

      setSchool((prev) => ({
        ...prev,
        photos: [...prev.photos, newPhotoWithUrl],
      }));
      setNewPhoto({ milestone: 30, caption: "" });
      setPhotoFile(null);
      setShowPhotoUpload(false);
      window.location.reload();
      Swal.fire("Success", "Photo added successfully", "success");
    } catch (error) {
      console.error("Gagal mengupload foto:", error);
      Swal.fire("Error", "Failed to upload photo");
    }
  };

  // Fungsi untuk mengubah status issue (selesai/belum)
  const toggleIssueStatus = async (issueId, currentStatus) => {
    try {
      await axios.patch(
        `${API_URL}/school-details/${id}/issues/${issueId}`, // Gunakan endpoint yang benar
        { resolved: !currentStatus }
      );

      setSchool((prev) => ({
        ...prev,
        issues: prev.issues.map((issue) =>
          issue.id === issueId ? { ...issue, resolved: !currentStatus } : issue
        ),
      }));
      Swal.fire("Success", "Issue status updated successfully", "success");
    } catch (error) {
      console.error("Gagal mengubah status masalah:", error);
      Swal.fire("Error", "Failed to update issue status");
    }
  };

  // Fungsi untuk menghapus foto
  const deletePhoto = async (photoId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
        cancelButton: "rounded-lg",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axios.delete(`${API_URL}/school-details/${id}/photos/${photoId}`);

        setSchool((prev) => ({
          ...prev,
          photos: prev.photos.filter((photo) => photo.id !== photoId),
        }));
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Photo deleted successfully.",
          customClass: {
            popup: "rounded-xl",
            confirmButton: "rounded-lg",
          },
        });
      }
    });
  };

  const uploadRabFile = async () => {
    if (!rabFile) {
      Swal.fire("Error", "Silakan pilih file RAB Excel", "error");
      return;
    }

    setUploadingRab(true);

    const formData = new FormData();
    formData.append("rabFile", rabFile);
    formData.append("schoolId", id);

    try {
      const res = await axios.post(`${API_URL}/rab-items/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.message) {
        Swal.fire("Success", res.data.message, "success");
        setShowRabUpload(false);
        setRabFile(null);
        // Refresh data RAB
        fetchRabData();
      } else {
        Swal.fire("Error", res.data.error || "Gagal mengupload RAB", "error");
      }
    } catch (error) {
      console.error("Error uploading RAB:", error);
      const errorMsg = error.response?.data?.error || "Gagal mengupload RAB";
      Swal.fire("Error", errorMsg, "error");
    } finally {
      setUploadingRab(false);
    }
  };

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
              <button
                onClick={() => setShowAddIssue(true)}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded flex items-center cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1" /> Tambah
              </button>
            </div>

            {showAddIssue && (
              <div className="mb-4 p-4 border border-gray-300 rounded-lg">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={newIssue.date}
                    onChange={(e) =>
                      setNewIssue({ ...newIssue, date: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Deskripsi Masalah
                  </label>
                  <textarea
                    value={newIssue.description}
                    onChange={(e) =>
                      setNewIssue({ ...newIssue, description: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    rows="3"
                  ></textarea>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={addIssue}
                    className="bg-blue-500 text-white text-sm px-3 py-1 rounded cursor-pointer"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => setShowAddIssue(false)}
                    className="bg-gray-300 text-gray-700 text-sm px-3 py-1 rounded cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {(school.issues || []).map((issue) => (
                <div
                  key={issue.id}
                  className={`p-3 rounded-lg ${
                    issue.resolved ? "bg-green-50" : "bg-yellow-50"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() =>
                        toggleIssueStatus(issue.id, issue.resolved)
                      }
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
              <button
                onClick={() => setEditingRecommendations(true)}
                className="text-blue-500 text-sm hover:text-blue-700 flex items-center cursor-pointer"
              >
                <Edit className="w-4 h-4 mr-1" /> Edit
              </button>
            </div>

            {editingRecommendations ? (
              <div>
                <textarea
                  value={newRecommendation}
                  onChange={(e) => setNewRecommendation(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 mb-2"
                  rows="4"
                ></textarea>
                <div className="flex space-x-2">
                  <button
                    onClick={saveRecommendations}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => {
                      setEditingRecommendations(false);
                      setNewRecommendation(school.recommendations);
                    }}
                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700">{school.recommendations}</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* DED/RAB */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            {/* Upload RAB */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload RAB (Format Excel)
              </label>

              {!showRabUpload ? (
                <button
                  onClick={() => setShowRabUpload(true)}
                  className="flex items-center bg-blue-500 text-white px-3 py-2 rounded text-sm"
                >
                  <Upload className="w-4 h-4 mr-1" /> Upload RAB Excel
                </button>
              ) : (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pilih File Excel
                    </label>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => setRabFile(e.target.files[0])}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format file harus .xlsx atau .xls
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={uploadRabFile}
                      disabled={uploadingRab || !rabFile}
                      className="flex items-center bg-green-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
                    >
                      {uploadingRab ? "Mengupload..." : "Simpan RAB"}
                    </button>
                    <button
                      onClick={() => {
                        setShowRabUpload(false);
                        setRabFile(null);
                      }}
                      className="bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Tampilkan data RAB jika ada */}
              {rabItems.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    Data RAB Terupload:
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
          </div>

          {/* Photo Gallery */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Galeri Foto Progres</h3>
              <button
                onClick={() => setShowPhotoUpload(true)}
                className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Tambah
              </button>
            </div>

            {showPhotoUpload && (
              <div className="mb-4 p-4 border border-gray-300 rounded-lg">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Milestone (%)
                  </label>
                  <select
                    value={newPhoto.milestone}
                    onChange={(e) =>
                      setNewPhoto({
                        ...newPhoto,
                        milestone: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="30">30%</option>
                    <option value="50">50%</option>
                    <option value="100">100%</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Keterangan
                  </label>
                  <input
                    type="text"
                    value={newPhoto.caption}
                    onChange={(e) =>
                      setNewPhoto({ ...newPhoto, caption: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="Contoh: Pekerjaan Pondasi"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Foto
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-1 block w-full"
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={addPhoto}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => setShowPhotoUpload(false)}
                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {(school.photos || []).map((photo) => (
                <div
                  key={photo.id}
                  className="border border-gray-300 rounded-lg overflow-hidden relative"
                >
                  <img
                    src={`${API_URL_STATIC}/school-progress/${photo.filename}`}
                    alt={photo.caption}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-2 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Progress {photo.milestone}%
                    </p>
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <TimeScheduleChart schoolId={school.id} schoolName={school.name} />
    </div>
  );
};

export default Layout;
