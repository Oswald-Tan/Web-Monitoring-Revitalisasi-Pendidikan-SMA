import { User, Edit, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../../../features/authSlice";

const Layout = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Inisialisasi form data dari user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await dispatch(updateProfile(formData)).unwrap();
      setMessage("Profil berhasil diperbarui!");
    } catch (error) {
      setMessage(error || "Gagal memperbarui profil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-3xl mx-auto border border-gray-200 overflow-hidden">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Profil Akun
        </h2>
        <div className="flex justify-center items-center mb-8">
          <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
            <div className="text-gray-600 font-semibold text-4xl">
              {(formData.name || formData.email).charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nomor Telepon
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <div className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400">
              {user?.role}
            </div>
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
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>

          {message && (
            <p className="text-center mt-4 text-green-600">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Layout;
