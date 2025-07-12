import React from 'react';
import { CheckCircle, TrendingUp } from 'lucide-react';

const Progress = () => {
  const progressData = [
    { kabupaten: 'Manado', progress: 75 },
    { kabupaten: 'Bitung', progress: 62 },
    { kabupaten: 'Tomohon', progress: 95 },
    { kabupaten: 'Minahasa', progress: 68 },
    { kabupaten: 'Minahasa Utara', progress: 55 },
    { kabupaten: 'Gorontalo', progress: 80 },
  ];

  const completedProjects = [
    {
      school: 'SMA Negeri 1 Tomohon',
      completion: '100%',
      testimonial: 'Fasilitas baru sangat membantu proses pembelajaran siswa',
      headmaster: 'Drs. Robert Mandagi, M.Pd'
    },
    {
      school: 'SMA Negeri 5 Manado',
      completion: '100%',
      testimonial: 'Renovasi laboratorium memberikan dampak positif bagi siswa',
      headmaster: 'Dr. Maria Toding, S.Pd'
    },
    {
      school: 'SMA Negeri 2 Gorontalo',
      completion: '100%',
      testimonial: 'Kualitas infrastruktur sekarang jauh lebih baik',
      headmaster: 'Ir. Yusuf Latief, M.T'
    }
  ];

  return (
    <section id="progress" className="py-20 bg-white">
      <div className="container mx-auto md:w-10/11 w-11/12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Progress Real-time</h2>
          <p className="text-xl text-gray-600">
            Pantau kemajuan pembangunan secara real-time dengan dashboard interaktif
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Kurva S */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Kurva S Capaian Fisik</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Kurva S Progress Chart</p>
                <p className="text-sm text-gray-400">Data real-time dari lapangan</p>
              </div>
            </div>
          </div>

          {/* Pie Chart Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Status Proyek</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-green-200 to-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-700">78%</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">Selesai</span>
                    </div>
                    <span className="text-sm font-medium">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-sm">Progress</span>
                    </div>
                    <span className="text-sm font-medium">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm">Terlambat</span>
                    </div>
                    <span className="text-sm font-medium">4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress per Kabupaten */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-16">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Progress per Kabupaten</h3>
          <div className="space-y-4">
            {progressData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-32 text-sm font-medium text-gray-700">{item.kabupaten}</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${
                        item.progress >= 80 ? 'bg-green-600' : 
                        item.progress >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-right text-sm font-medium text-gray-700">
                  {item.progress}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highlight Proyek */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Proyek yang Telah Selesai</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {completedProjects.map((project, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {project.completion}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 mb-3">{project.school}</h4>
                <blockquote className="text-gray-600 italic mb-4">
                  "{project.testimonial}"
                </blockquote>
                <div className="text-sm text-gray-500">
                  — {project.headmaster}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Progress;