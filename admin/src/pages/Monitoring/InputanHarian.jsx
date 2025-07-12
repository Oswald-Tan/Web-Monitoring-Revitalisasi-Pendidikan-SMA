import { useState } from "react";
import mockData from "../../data/mockData";
import { Download, Upload } from 'lucide-react';

const InputHarian = () => {
  const [selectedSchool, setSelectedSchool] = useState('');
  const [progress, setProgress] = useState(0);
  const [activities, setActivities] = useState('');
  const [recommendations, setRecommendations] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-white">Input Harian</h2>
        <div className="text-sm text-gray-500">
          Tanggal: {new Date().toLocaleDateString('id-ID')}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
        <form className="space-y-6">
          {/* School Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Sekolah
            </label>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih sekolah...</option>
              {mockData.schools.map(school => (
                <option key={school.id} value={school.id}>
                  {school.name} - {school.location}
                </option>
              ))}
            </select>
          </div>

          {/* Progress Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progress Fisik ({progress}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Activities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aktivitas Harian
            </label>
            <textarea
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              placeholder="Supervisi struktur beton, verifikasi material, dll..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Dokumentasi
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Klik untuk upload foto/video atau drag & drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Maksimal 5 foto, video 2 menit
              </p>
            </div>
          </div>

          {/* Quality Checklist */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Checklist QC
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">Pondasi sesuai DED</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">Material SNI</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">Struktur beton sesuai spesifikasi</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">Keamanan kerja terjaga</span>
              </label>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rekomendasi
            </label>
            <textarea
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Catatan teknis dan rekomendasi..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputHarian;