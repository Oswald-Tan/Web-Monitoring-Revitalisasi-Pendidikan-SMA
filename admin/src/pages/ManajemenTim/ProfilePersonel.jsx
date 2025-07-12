import mockData from "../../data/mockData";
import { User, UserPlus, Edit, Trash2 } from "lucide-react";

const ProfilPersonel = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">Profil Personel</h2>
      <div className="flex items-center justify-between">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <UserPlus className="w-4 h-4" />
          <span>Tambah Personel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockData.personnel.map((person) => (
          <div
            key={person.id}
            className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden"
          >
            <div className="p-4 border-b border-b-gray-300 flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-bold text-gray-800">{person.name}</h3>
                <p className="text-sm text-blue-600">{person.role}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Kualifikasi</p>
                <p className="text-gray-600">{person.qualifications}</p>
              </div>
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Sertifikasi</p>
                <p className="text-gray-600">{person.certifications}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Zona Tugas</p>
                <p className="text-gray-600">{person.zone}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-between">
              <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                <Edit className="w-4 h-4 mr-1" />
                <span>Edit</span>
              </button>
              <button className="text-red-600 hover:text-red-800 text-sm flex items-center">
                <Trash2 className="w-4 h-4 mr-1" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilPersonel;
