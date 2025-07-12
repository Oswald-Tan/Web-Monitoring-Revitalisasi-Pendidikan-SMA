import React, { useState } from 'react';
import { MapPin, School, Filter } from 'lucide-react';

const Sekolah = () => {
  const [selectedKabupaten, setSelectedKabupaten] = useState('semua');
  
  // Data dummy untuk sekolah
  const schools = [
    { id: 1, name: 'SMA Negeri 1 Manado', location: 'Manado', progress: 85, fasilitator: 'Dr. Ahmad Santoso', kabupaten: 'Manado', status: 'hijau' },
    { id: 2, name: 'SMA Negeri 2 Bitung', location: 'Bitung', progress: 62, fasilitator: 'Ir. Siti Rahayu', kabupaten: 'Bitung', status: 'kuning' },
    { id: 3, name: 'SMA Negeri 1 Tomohon', location: 'Tomohon', progress: 95, fasilitator: 'M. Rizki Pratama', kabupaten: 'Tomohon', status: 'hijau' },
    { id: 4, name: 'SMA Negeri 3 Manado', location: 'Manado', progress: 45, fasilitator: 'Dra. Nina Wulandari', kabupaten: 'Manado', status: 'merah' },
    { id: 5, name: 'SMA Negeri 1 Minahasa', location: 'Tondano', progress: 78, fasilitator: 'Dr. Budi Setiawan', kabupaten: 'Minahasa', status: 'hijau' },
    { id: 6, name: 'SMA Negeri 2 Minahasa Utara', location: 'Airmadidi', progress: 55, fasilitator: 'Ir. Maya Sari', kabupaten: 'Minahasa Utara', status: 'kuning' },
  ];

  const kabupatenList = ['semua', 'Manado', 'Bitung', 'Tomohon', 'Minahasa', 'Minahasa Utara'];

  const filteredSchools = selectedKabupaten === 'semua' 
    ? schools 
    : schools.filter(school => school.kabupaten === selectedKabupaten);

  return (
    <section id="sekolah" className="py-20 bg-gray-50">
      <div className="container mx-auto md:w-10/11 w-11/12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Sekolah Sasaran</h2>
          <p className="text-xl text-gray-600">
            24 sekolah telah dipilih untuk mendapatkan program revitalisasi infrastruktur
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">Filter by Kabupaten:</span>
            <select
              value={selectedKabupaten}
              onChange={(e) => setSelectedKabupaten(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {kabupatenList.map(kabupaten => (
                <option key={kabupaten} value={kabupaten}>
                  {kabupaten === 'semua' ? 'Semua Kabupaten' : kabupaten}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabel Sekolah */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Sekolah</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fasilitator</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSchools.map((school) => (
                  <tr key={school.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <School className="w-5 h-5 text-gray-400 mr-3" />
                        <div className="font-medium text-gray-900">{school.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{school.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className={`h-2 rounded-full ${
                              school.progress >= 80 ? 'bg-green-600' : 
                              school.progress >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${school.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{school.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {school.fasilitator}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        school.status === 'hijau' ? 'bg-green-100 text-green-800' :
                        school.status === 'kuning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {school.status === 'hijau' ? 'On Track' : 
                         school.status === 'kuning' ? 'In Progress' : 'Delayed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Galeri Dokumentasi */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Galeri Dokumentasi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Before - SMA Negeri 1 Tomohon', type: 'before' },
              { title: 'After - SMA Negeri 1 Tomohon', type: 'after' },
              { title: 'Progress 50% - SMA Negeri 2 Bitung', type: 'progress' },
              { title: 'Before - SMA Negeri 3 Manado', type: 'before' },
              { title: 'Progress 75% - SMA Negeri 1 Minahasa', type: 'progress' },
              { title: 'After - SMA Negeri 5 Manado', type: 'after' }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-green-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                  <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 px-3 py-1 rounded-full">
                    <span className={`text-xs font-medium ${
                      item.type === 'before' ? 'text-red-600' :
                      item.type === 'after' ? 'text-green-600' :
                      'text-yellow-600'
                    }`}>
                      {item.type === 'before' ? 'Before' : 
                       item.type === 'after' ? 'After' : 'In Progress'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sekolah;