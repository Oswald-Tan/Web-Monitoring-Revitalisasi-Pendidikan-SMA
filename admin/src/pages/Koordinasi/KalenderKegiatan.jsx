import mockData from "../../data/mockData";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const KalenderKegiatan = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">Kalender Kegiatan</h2>
      <div className="flex items-center justify-between">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <CalendarDays className="w-4 h-4" />
          <span>Tambah Kegiatan</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">September 2025</h3>
          <div className="flex space-x-2">
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 px-3">
              Hari Ini
            </button>
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tambahkan overflow-x-auto di sini */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px]"> {/* Tambahkan lebar minimum */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                <div
                  key={day}
                  className={`border border-gray-300 rounded-lg p-2 min-h-24 ${
                    day === 15 ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  <div
                    className={`text-right text-sm ${
                      day === 15 ? "font-bold text-blue-600" : ""
                    }`}
                  >
                    {day}
                  </div>
                  {day === 15 && (
                    <div className="mt-1 text-xs bg-blue-100 text-blue-800 p-1 rounded">
                      <div>Kunjungan Lapangan</div>
                      <div className="text-gray-600">09:00-12:00</div>
                    </div>
                  )}
                  {day === 18 && (
                    <div className="mt-1 text-xs bg-green-100 text-green-800 p-1 rounded">
                      <div>Rapat Koordinasi</div>
                      <div className="text-gray-600">14:00-16:00</div>
                    </div>
                  )}
                  {day === 22 && (
                    <div className="mt-1 text-xs bg-purple-100 text-purple-800 p-1 rounded">
                      <div>QC Struktur Beton</div>
                      <div className="text-gray-600">10:00-12:00</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Kegiatan Mendatang</h3>
          <div className="space-y-3">
            {mockData.calendarEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 border rounded-lg flex items-start"
              >
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-gray-600">
                    {event.date} | {event.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KalenderKegiatan;