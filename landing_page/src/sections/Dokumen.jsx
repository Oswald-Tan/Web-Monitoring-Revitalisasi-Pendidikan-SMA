import React from 'react';
import { Download, FileText } from 'lucide-react';

const Dokumen = () => {
  return (
    <section id="dokumen" className="py-20 bg-gray-50">
      <div className="container mx-auto md:w-10/11 w-11/12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Dokumen & Regulasi</h2>
          <p className="text-xl text-gray-600">
            Akses dokumen legal dan regulasi terkait program revitalisasi
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Juknis DAK Fisik',
              description: 'Petunjuk teknis Dana Alokasi Khusus bidang infrastruktur',
              type: 'PDF',
              size: '2.5 MB'
            },
            {
              title: 'RPJMN 2020-2024',
              description: 'Rencana Pembangunan Jangka Menengah Nasional',
              type: 'PDF',
              size: '15.8 MB'
            },
            {
              title: 'Kontrak Kerja',
              description: 'Dokumen kontrak pelaksanaan proyek',
              type: 'PDF',
              size: '1.2 MB'
            },
            {
              title: 'Standar Operasional',
              description: 'SOP pelaksanaan dan monitoring proyek',
              type: 'PDF',
              size: '3.1 MB'
            },
            {
              title: 'Laporan Kemajuan',
              description: 'Laporan bulanan progress pelaksanaan',
              type: 'PDF',
              size: '5.7 MB'
            },
            {
              title: 'Dokumentasi Teknis',
              description: 'Spesifikasi teknis dan gambar kerja',
              type: 'ZIP',
              size: '45.3 MB'
            }
          ].map((doc, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <FileText className="w-12 h-12 text-amber-500" />
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                  {doc.type}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{doc.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{doc.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{doc.size}</span>
                <button className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Dokumen;