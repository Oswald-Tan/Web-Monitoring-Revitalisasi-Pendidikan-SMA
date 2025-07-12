import mockData from "../../data/mockData";
import { Download } from 'lucide-react';

const ReviuMingguan = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-white">Reviu Mingguan</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparison Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
          <h3 className="text-lg font-semibold mb-4">Perbandingan Rencana vs Realisasi</h3>
          <div className="space-y-4">
            {mockData.weeklyReview.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{item.week}</span>
                  <span className="text-sm text-gray-600">{item.actual}% / {item.planned}%</span>
                </div>
                <div className="flex h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-600" 
                    style={{ width: `${item.actual}%` }}
                  ></div>
                  <div 
                    className="bg-blue-600" 
                    style={{ width: `${item.planned - item.actual}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Realisasi</span>
                  <span>Rencana</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Issues */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
          <h3 className="text-lg font-semibold mb-4">Top 5 Masalah Teknis</h3>
          <div className="space-y-3">
            {mockData.topIssues.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{item.issue}</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                  {item.count} laporan
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviuMingguan;