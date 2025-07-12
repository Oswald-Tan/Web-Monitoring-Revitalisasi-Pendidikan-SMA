import React from "react";
import { Users, Target } from "lucide-react";
import LogoPoli from "../assets/logo_poli.webp";

const Tim = () => {
  return (
    <section id="tim" className="py-20 bg-white">
      <div className="container mx-auto md:w-10/11 w-11/12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Tim Pelaksana
          </h2>
          <p className="text-xl text-gray-600">
            Tim profesional yang bertanggung jawab dalam pelaksanaan program
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Ketua Tim */}
          <div className="md:col-span-4 mb-8">
            <div className="bg-amber-50 rounded-xl p-8 text-center">
              <div className="w-24 h-24 bg-amber-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-12 h-12 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Prof. Dr. Ir. Sudirman Yahya, M.Sc.
              </h3>
              <p className="text-amber-600 font-medium mb-2">
                Ketua Tim Pelaksana
              </p>
              <p className="text-gray-600 text-sm">
                Koordinator utama program dengan pengalaman 25 tahun dalam
                pembangunan infrastruktur pendidikan
              </p>
            </div>
          </div>

          {/* Koordinator */}
          <div className="md:col-span-2">
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">
                Dr. Sari Dewi Angraeni, M.T.
              </h4>
              <p className="text-green-600 font-medium text-sm mb-2">
                Koordinator Sulawesi Utara
              </p>
              <p className="text-gray-600 text-xs">
                Mengkoordinasi 18 sekolah di wilayah Sulawesi Utara
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">
                Ir. Muhammad Arsyad, M.Eng.
              </h4>
              <p className="text-green-600 font-medium text-sm mb-2">
                Koordinator Gorontalo
              </p>
              <p className="text-gray-600 text-xs">
                Mengkoordinasi 6 sekolah di wilayah Gorontalo
              </p>
            </div>
          </div>

          {/* Partner */}
          <div className="md:col-span-4">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                {/* <Target className="w-8 h-8 text-gray-600" /> */}
                <img
                  src={LogoPoli}
                  alt="Logo Politeknik Negeri Manado"
                  className="md:w-11 md:h-11 w-10 h-10"
                />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">
                Politeknik Negeri Manado
              </h4>
              <p className="text-gray-600 text-sm">
                Institusi partner yang menyediakan tenaga ahli dan dukungan
                teknis dalam pelaksanaan program
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Tim;
