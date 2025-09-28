import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import { Download, Upload, X } from "lucide-react";
import Swal from "sweetalert2";

const Layout = () => {
  const [formData, setFormData] = useState({
    schoolId: "",
    rabItemId: "",
    tanggal: new Date().toISOString().split("T")[0],
    progress: 0,
    keterangan: "",
    files: [],
  });

  const [checklist, setChecklist] = useState({
    pondasiSesuaiDED: false,
    materialSNI: false,
    strukturBetonSesuaiSpesifikasi: false,
    keamananKerjaTerjaga: false,
  });

  const [schools, setSchools] = useState([]);
  const [rabItems, setRabItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Fetch schools on component mount
  useEffect(() => {
    fetchSchools();
  }, []);

  // Fetch RAB items when school is selected
  useEffect(() => {
    if (formData.schoolId) {
      fetchRabItems(formData.schoolId);
    } else {
      setRabItems([]);
    }
  }, [formData.schoolId]);

  useEffect(() => {
    return () => {
      // Clean up object URLs untuk menghindari memory leaks
      formData.files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [formData.files]);

  // Handler untuk checklist
  const handleChecklistChange = (e) => {
    const { name, checked } = e.target;
    setChecklist((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${API_URL}/schools/names`);
      if (Array.isArray(response.data)) {
        setSchools(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setSchools(response.data.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setSchools([]);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const fetchRabItems = async (schoolId) => {
    try {
      const res = await axios.get(`${API_URL}/rab-items/school/${schoolId}`);
      if (res.data && Array.isArray(res.data.data)) {
        setRabItems(res.data.data);
      } else {
        console.error("Unexpected response format:", res.data);
        setRabItems([]);
      }
    } catch (error) {
      console.error("Error fetching RAB items:", error);
      setRabItems([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Validasi jenis file
    const validFiles = selectedFiles.filter((file) => {
      const fileType = file.type.split("/")[0];
      return fileType === "image" || fileType === "video";
    });

    // Cegah duplikasi file berdasarkan nama dan ukuran
    const uniqueFiles = validFiles.filter(
      (newFile) =>
        !formData.files.some(
          (existingFile) =>
            existingFile.name === newFile.name &&
            existingFile.size === newFile.size
        )
    );

    // Batasi maksimal 5 file
    const filesToAdd = uniqueFiles.slice(0, 5 - formData.files.length);

    if (filesToAdd.length > 0) {
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...filesToAdd],
      }));
    }

    // Kalau ada file tidak valid → tampilkan Swal
    if (validFiles.length < selectedFiles.length) {
      Swal.fire({
        icon: "error",
        title: "File tidak valid",
        text: "Hanya file gambar dan video yang diizinkan!",
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Gunakan event synthetic untuk memproses file yang di-drop
      const syntheticEvent = {
        target: {
          files: e.dataTransfer.files,
        },
      };
      handleFileChange(syntheticEvent);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("schoolId", formData.schoolId);
      submitData.append("rabItemId", formData.rabItemId);
      submitData.append("tanggal", formData.tanggal);
      submitData.append("progress", formData.progress);
      submitData.append("keterangan", formData.keterangan);
      submitData.append("checklist", JSON.stringify(checklist));

      // Append semua file
      formData.files.forEach((file) => {
        submitData.append("files", file);
      });

      await axios.post(`${API_URL}/daily-reports`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Tampilkan SweetAlert
      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Laporan harian berhasil disimpan!",
        confirmButtonColor: "#3b82f6",
      });

      // Reset semua state termasuk checklist
      setFormData({
        schoolId: "", // Reset sekolah juga
        rabItemId: "",
        tanggal: new Date().toISOString().split("T")[0],
        progress: 0,
        keterangan: "",
        files: [],
      });

      // Reset checklist
      setChecklist({
        pondasiSesuaiDED: false,
        materialSNI: false,
        strukturBetonSesuaiSpesifikasi: false,
        keamananKerjaTerjaga: false,
      });
    } catch (error) {
      console.error("Error submitting daily report:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal menyimpan laporan harian",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Input Harian</h2>
        <div className="text-sm text-gray-500">
          Tanggal: {new Date().toLocaleDateString("id-ID")}
        </div>
      </div>

      <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* School Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Sekolah
            </label>
            <select
              name="schoolId"
              value={formData.schoolId}
              onChange={handleChange}
              required
              className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-sm"
            >
              <option value="">Pilih sekolah...</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* Item Pekerjaan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Pekerjaan
            </label>
            <select
              name="rabItemId"
              value={formData.rabItemId}
              onChange={handleChange}
              required
              disabled={!formData.schoolId || rabItems.length === 0}
              className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-sm"
            >
              <option value="">Pilih Item Pekerjaan</option>
              {rabItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.uraian} - {item.building || ""}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal
            </label>
            <input
              type="date"
              name="tanggal"
              value={formData.tanggal}
              onChange={handleChange}
              required
              className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-sm"
            ></input>
          </div>

          {/* Progress Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progress (%)
            </label>
            {/* RangeSlider integrated directly */}
            <div className="relative pt-1">
              <input
                type="range"
                min={0}
                max={100}
                value={formData.progress}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    progress: parseInt(e.target.value),
                  }))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${formData.progress}%, #d1d5db ${formData.progress}%, #d1d5db 100%)`,
                }}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keterangan
            </label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              rows={4}
              placeholder="Deskripsi aktivitas yang dilakukan..."
              className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-sm"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Dokumentasi
            </label>
            <label
              htmlFor="file-upload"
              className={`border-2 ${
                dragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-dashed border-gray-300"
              } w-full p-6 text-center rounded-xl shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-sm cursor-pointer flex flex-col items-center justify-center`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Klik untuk upload foto/video atau drag & drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Maksimal 5 foto, video 2 menit
              </p>
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              multiple
              accept="image/*,video/*"
              className="hidden"
            />

            {/* Menampilkan file yang telah dipilih */}
            {formData.files.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  File Terpilih:
                </p>
                <div className="space-y-2">
                  {formData.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-100 rounded-md"
                    >
                      <span className="text-sm text-gray-700 truncate max-w-xs">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quality Checklist */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Checklist QC
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="pondasiSesuaiDED"
                  checked={checklist.pondasiSesuaiDED}
                  onChange={handleChecklistChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  Pondasi sesuai DED
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="materialSNI"
                  checked={checklist.materialSNI}
                  onChange={handleChecklistChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  Material SNI
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="strukturBetonSesuaiSpesifikasi"
                  checked={checklist.strukturBetonSesuaiSpesifikasi}
                  onChange={handleChecklistChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  Struktur beton sesuai spesifikasi
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="keamananKerjaTerjaga"
                  checked={checklist.keamananKerjaTerjaga}
                  onChange={handleChecklistChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  Keamanan kerja terjaga
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Simpan Draft
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {loading ? "Menyimpan..." : "Simpan Laporan Harian"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Layout;
