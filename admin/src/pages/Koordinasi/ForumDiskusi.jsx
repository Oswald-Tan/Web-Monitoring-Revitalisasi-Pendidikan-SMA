import mockData from "../../data/mockData";
import { MessageSquare } from 'lucide-react';

const ForumDiskusi = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold  dark:text-white">Forum Diskusi</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockData.discussionThreads.map(thread => (
          <div key={thread.id} className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
            <div className="p-4 border-b border-b-gray-300">
              <h3 className="font-bold ">{thread.school}</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">Update terakhir: {thread.lastUpdate}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">{thread.messages} pesan</span>
                {thread.unread > 0 && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {thread.unread} baru
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 bg-gray-50">
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                <span>Buka Diskusi</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-300">
        <h3 className="text-lg font-semibold mb-4">Buat Thread Baru</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Judul Thread</label>
            <input
              type="text"
              placeholder="Masukkan judul diskusi"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sekolah</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Pilih sekolah...</option>
              {mockData.schools.map(school => (
                <option key={school.id}>{school.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pesan</label>
            <textarea
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tulis pesan Anda..."
            ></textarea>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Buat Thread
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForumDiskusi;