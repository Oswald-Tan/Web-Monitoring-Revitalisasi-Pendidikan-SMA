import { Download } from 'lucide-react';

const DetailSekolah = () => {
  // Dummy data for a school
  const school = {
    id: 1,
    name: 'SMA Negeri 1 Manado',
    location: 'Manado',
    progress: 85,
    facilitator: 'Ahmad Wijaya',
    status: 'on-track',
    dedRab: 'https://example.com/ded-rab.pdf',
    photos: [
      { id: 1, url: 'https://via.placeholder.com/300', caption: 'Progress 30%' },
      { id: 2, url: 'https://via.placeholder.com/300', caption: 'Progress 60%' },
      { id: 3, url: 'https://via.placeholder.com/300', caption: 'Progress 85%' },
    ],
    issues: [
      { id: 1, date: '2025-09-15', description: 'Keterlambatan pengiriman material beton', resolved: false },
      { id: 2, date: '2025-09-20', description: 'Hujan deras mengganggu pekerjaan pondasi', resolved: true },
    ],
    recommendations: 'Perlu koordinasi dengan supplier material untuk percepatan pengiriman. Juga perlu penjadwalan ulang untuk pekerjaan yang tertunda akibat hujan.'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold  dark:text-white">Detail Sekolah: {school.name}</h2>
        <div className="text-sm text-gray-500">
          Lokasi: {school.location} | Fasilitator: {school.facilitator}
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
              <span className="text-lg font-bold text-gray-800">{school.progress}%</span>
            </div>
          </div>

          {/* Issues */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            <h3 className="text-lg font-semibold mb-4">Catatan Masalah</h3>
            <div className="space-y-4">
              {school.issues.map(issue => (
                <div key={issue.id} className={`p-3 rounded-lg ${issue.resolved ? 'bg-green-50' : 'bg-yellow-50'}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${issue.resolved ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <div>
                      <p className="font-medium text-gray-800">{issue.description}</p>
                      <p className="text-sm text-gray-600">Tanggal: {issue.date} | Status: {issue.resolved ? 'Selesai' : 'Belum Selesai'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            <h3 className="text-lg font-semibold mb-4">Rekomendasi</h3>
            <p className="text-gray-700">{school.recommendations}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* DED/RAB */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            <h3 className="text-lg font-semibold mb-4">Dokumen DED/RAB</h3>
            <a 
              href={school.dedRab} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              <span>Download DED/RAB</span>
            </a>
          </div>

          {/* Photo Gallery */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            <h3 className="text-lg font-semibold mb-4">Galeri Foto Progres</h3>
            <div className="grid grid-cols-2 gap-4">
              {school.photos.map(photo => (
                <div key={photo.id} className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-200 aspect-square"></div>
                  <p className="p-2 text-sm text-gray-600">{photo.caption}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailSekolah;