import React from 'react';
import { School, Target, MapPin } from 'lucide-react';

const Hero = () => {
  return (
    <section id="beranda" className="bg-gradient-to-br from-amber-600 to-amber-900 text-white py-20">
      <div className="container mx-auto md:w-10/11 w-11/12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Portal Monitoring Revitalisasi Infrastruktur Pendidikan
            </h2>
            <p className="text-xl mb-8 text-amber-100">
              Memantau progress pembangunan dan renovasi 24 sekolah di Sulawesi Utara secara real-time
            </p>
            
            {/* Statistik Utama */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">24</div>
                <div className="text-sm text-amber-100">Sekolah Terevitalisasi</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300">78%</div>
                <div className="text-sm text-amber-100">Progress Nasional</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-300">142</div>
                <div className="text-sm text-amber-100">Dokumen Tersedia</div>
              </div>
            </div>

            <button
              onClick={() => {
                const element = document.getElementById('program');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-amber-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Jelajahi Program
            </button>
          </div>

          {/* Peta Interaktif */}
          <div className="bg-white rounded-xl p-6 shadow-2xl">
            <h3 className="text-gray-900 font-semibold mb-4">Peta Sebaran Sekolah</h3>
            <div className="relative h-80 bg-gray-100 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
                {/* Simulasi pin sekolah */}
                <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/5 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                <div className="absolute top-1/5 left-1/2 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                
                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
                  <div className="text-xs text-gray-700 mb-2 font-medium">Status Progress:</div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Selesai/On Track</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Dalam Progress</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Terlambat</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;