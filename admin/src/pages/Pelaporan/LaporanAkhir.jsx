import mockData from "../../data/mockData";
import { Download } from 'lucide-react';

const LaporanAkhir = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-white">Laporan Akhir</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Generate Laporan</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Pilih Sekolah</h3>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Semua Sekolah</option>
            {mockData.schools.map(school => (
              <option key={school.id}>{school.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Section Laporan</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span>Ringkasan Eksekutif</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span>Capaian Fisik</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Analisis Biaya</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Dokumentasi</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span>Rekomendasi</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Lampiran Teknis</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Tambah Section Custom</h3>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Nama section"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Tambah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanAkhir;