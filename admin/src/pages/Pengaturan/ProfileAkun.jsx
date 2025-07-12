import { useState } from "react";
import { User, Edit, Lock } from "lucide-react";

const ProfilAkun = () => {
  const [user, setUser] = useState({
    name: 'Admin User',
    email: 'admin@revitalisasi.id',
    phone: '081234567890',
    role: 'Administrator',
    notifications: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">Profil Akun</h2>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300 max-w-3xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-gray-600" />
          </div>
          <div className="ml-4">
            <button className="text-blue-600 text-sm flex items-center">
              <Edit className="w-4 h-4 mr-1" />
              <span>Ubah Foto</span>
            </button>
          </div>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
            <input
              type="tel"
              name="phone"
              value={user.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <div className="p-3 bg-gray-100 rounded-lg">
              {user.role}
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                name="notifications"
                checked={user.notifications}
                onChange={handleChange}
                className="mr-2" 
              />
              <span className="text-sm text-gray-700">Terima notifikasi email</span>
            </label>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              type="button"
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center"
            >
              <Lock className="w-4 h-4 mr-2" />
              <span>Ubah Password</span>
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilAkun;