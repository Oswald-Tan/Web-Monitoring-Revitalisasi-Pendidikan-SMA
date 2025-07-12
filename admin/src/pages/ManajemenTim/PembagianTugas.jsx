import React from 'react';
import mockData from '../../data/mockData';
import { Save } from 'lucide-react';

const PembagianTugas = () => {
  const facilitators = [
    { id: 1, name: 'Ahmad Wijaya', current: 6, max: 8 },
    { id: 2, name: 'Siti Nurhaliza', current: 4, max: 8 },
    { id: 3, name: 'Budi Santoso', current: 5, max: 8 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">Pembagian Tugas</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Facilitator List */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-300">
          <h3 className="text-lg font-semibold mb-4">Fasilitator</h3>
          <div className="space-y-4">
            {facilitators.map(facilitator => (
              <div 
                key={facilitator.id}
                className="p-4 border border-gray-300 rounded-lg bg-gray-50"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{facilitator.name}</span>
                  <span>{facilitator.current}/{facilitator.max} sekolah</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(facilitator.current / facilitator.max) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* School Assignment */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-300">
          <h3 className="text-lg font-semibold mb-4">Penugasan Sekolah</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockData.schools.map(school => (
              <div 
                key={school.id}
                className="p-4 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{school.name}</div>
                  <div className="text-sm text-gray-600">{school.location}</div>
                </div>
                <select className="border border-gray-300 rounded-lg px-2 py-1 text-sm">
                  <option>Pilih fasilitator...</option>
                  {facilitators.map(f => (
                    <option key={f.id} selected={school.facilitator === f.name}>{f.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
              <Save className="w-4 h-4 mr-2" />
              <span>Simpan Pembagian Tugas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PembagianTugas;