import { CheckCircle, Target, Play } from "lucide-react";

const Program = () => {
  const timelineItems = [
    {
      month: "Juli 2025",
      milestone: "Kickoff & Persiapan",
      status: "completed",
    },
    {
      month: "Agustus 2025",
      milestone: "Survei & Perencanaan Detail",
      status: "completed",
    },
    {
      month: "September 2025",
      milestone: "Pelaksanaan Fase I",
      status: "current",
    },
    {
      month: "Oktober 2025",
      milestone: "Pelaksanaan Fase II",
      status: "upcoming",
    },
    { month: "November 2025", milestone: "Finishing & QC", status: "upcoming" },
    {
      month: "Desember 2025",
      milestone: "Serah Terima & Evaluasi",
      status: "upcoming",
    },
  ];
  
  return (
    <section id="program" className="py-20 bg-white">
      <div className="container mx-auto md:w-10/11 w-11/12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Tentang Program
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Program Revitalisasi Infrastruktur Pendidikan bertujuan meningkatkan
            kualitas fasilitas sekolah untuk mendukung proses pembelajaran yang
            lebih efektif dan berkualitas.
          </p>
        </div>

        {/* Video Explainer */}
        <div className="mb-16">
          <div className="bg-gray-900 rounded-xl aspect-video max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-6 hover:bg-opacity-30 transition-all">
                <Play className="w-12 h-12 text-white ml-1" />
              </button>
            </div>
            <div className="absolute bottom-4 left-4 text-white">
              <div className="text-sm font-medium">Video Explainer Program</div>
              <div className="text-xs opacity-75">Duration: 60 seconds</div>
            </div>
          </div>
        </div>

        {/* Tujuan & Manfaat */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Tujuan Program
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-gray-700">
                  Meningkatkan kualitas infrastruktur pendidikan di daerah
                  tertinggal
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-gray-700">
                  Menciptakan lingkungan belajar yang kondusif dan modern
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-gray-700">
                  Mendukung peningkatan kualitas pendidikan nasional
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Manfaat Program
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Target className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" />
                <p className="text-gray-700">
                  Siswa mendapat fasilitas belajar yang lebih baik dan modern
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Target className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" />
                <p className="text-gray-700">
                  Guru dapat mengajar dengan peralatan dan ruang yang memadai
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Target className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" />
                <p className="text-gray-700">
                  Masyarakat mendapat akses pendidikan berkualitas tinggi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gray-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Timeline Program
          </h3>
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>

            {/* Timeline Items */}
            <div className="space-y-8">
              {timelineItems.map((item, index) => (
                <div key={index} className="relative flex items-center">
                  {/* Desktop Layout */}
                  <div className="hidden md:flex w-full items-center">
                    {/* Left Content (even index) */}
                    {index % 2 === 0 && (
                      <div className="w-1/2 pr-8 text-right">
                        <div className="font-semibold text-gray-900">
                          {item.month}
                        </div>
                        <div className="text-gray-600">{item.milestone}</div>
                      </div>
                    )}

                    {/* Empty space for odd index */}
                    {index % 2 !== 0 && <div className="w-1/2"></div>}

                    {/* Center Dot */}
                    <div className="relative flex-shrink-0 z-10">
                      <div
                        className={`w-4 h-4 rounded-full border-4 ${
                          item.status === "completed"
                            ? "bg-green-500 border-green-500"
                            : item.status === "current"
                            ? "bg-amber-500 border-amber-500"
                            : "bg-gray-300 border-gray-300"
                        }`}
                      ></div>
                    </div>

                    {/* Right Content (odd index) */}
                    {index % 2 !== 0 && (
                      <div className="w-1/2 pl-8 text-left">
                        <div className="font-semibold text-gray-900">
                          {item.month}
                        </div>
                        <div className="text-gray-600">{item.milestone}</div>
                      </div>
                    )}

                    {/* Empty space for even index */}
                    {index % 2 === 0 && <div className="w-1/2"></div>}
                  </div>

                  {/* Mobile Layout */}
                  <div className="md:hidden flex w-full items-center">
                    {/* Left Content or Empty Space */}
                    {index % 2 === 0 ? (
                      <div className="w-1/2 pr-4 text-right">
                        <div className="font-semibold text-gray-900">
                          {item.month}
                        </div>
                        <div className="text-gray-600">{item.milestone}</div>
                      </div>
                    ) : (
                      <div className="w-1/2"></div>
                    )}

                    {/* Center Dot */}
                    <div className="relative flex-shrink-0 z-10">
                      <div
                        className={`w-4 h-4 rounded-full border-4 ${
                          item.status === "completed"
                            ? "bg-green-500 border-green-500"
                            : item.status === "current"
                            ? "bg-blue-500 border-blue-500"
                            : "bg-gray-300 border-gray-300"
                        }`}
                      ></div>
                    </div>

                    {/* Right Content or Empty Space */}
                    {index % 2 !== 0 ? (
                      <div className="w-1/2 pl-4 text-left">
                        <div className="font-semibold text-gray-900">
                          {item.month}
                        </div>
                        <div className="text-gray-600">{item.milestone}</div>
                      </div>
                    ) : (
                      <div className="w-1/2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Program;
