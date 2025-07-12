import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config";
import Swal from "sweetalert2";

const prodiOptions = [
  "D3 Administrasi Bisnis",
  "D3 Manajemen Pemasaran",
  "D4 Manajemen Bisnis",
];

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "staf_tu", label: "Staf Tata Usaha" },
];

const Layout = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "",
    status: "active",
    prodiAdmin: "",
    fullname: "",
    email: "",
    phone_number: "",
    nip: "",
    jabatan: "",
    address: "",
    photo_profile: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^(?:\+62|0)[0-9]{8,12}$/;
    return re.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo_profile: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveUser = async (e) => {
    e.preventDefault();
    setMsg("");

    // Validasi wajib
    const requiredFields = [
      "username",
      "password",
      "confirmPassword",
      "role",
      "fullname",
      "email",
      "phone_number",
    ];

    const isFieldMissing = requiredFields.some((field) => !formData[field]);

    if (isFieldMissing) {
      setMsg("Semua field wajib harus diisi");
      return;
    }

    if (!validateEmail(formData.email)) {
      setMsg("Format email tidak valid");
      return;
    }

    if (!validatePhone(formData.phone_number)) {
      setMsg("Format nomor HP tidak valid. Gunakan format 08xxx atau +62xxx");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMsg("Password dan konfirmasi password tidak cocok");
      return;
    }

    if (formData.password.length < 8) {
      setMsg("Password minimal 8 karakter");
      return;
    }

    try {
      const formPayload = new FormData();

      // Append user data
      formPayload.append("username", formData.username);
      formPayload.append("password", formData.password);
      formPayload.append("role", formData.role);
      formPayload.append("status", formData.status);
      formPayload.append("prodiAdmin", formData.prodiAdmin);

      // Append detail user data
      formPayload.append("fullname", formData.fullname);
      formPayload.append("email", formData.email);
      formPayload.append("phone_number", formData.phone_number);
      formPayload.append("nip", formData.nip);
      formPayload.append("jabatan", formData.jabatan);
      formPayload.append("address", formData.address);

      // Append file jika ada
      if (formData.photo_profile) {
        formPayload.append("photo_profile", formData.photo_profile);
      }

      await axios.post(`${API_URL}/users/add-admin-prodi`, formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Admin Prodi berhasil ditambahkan",
      });
      navigate("/users/admin");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Terjadi kesalahan";
      setMsg(errorMsg);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-black-100 dark:text-white mb-4">
        Tambah Data
      </h1>

      <div className="bg-white dark:bg-[#282828] p-6 rounded-lg shadow-md">
        {msg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {msg}
          </div>
        )}

        <form onSubmit={saveUser}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium dark:text-white">
                Informasi Akun
              </h2>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm "
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  required
                >
                  <option value="">Pilih Role</option>
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Program Studi
                </label>
                <select
                  name="prodiAdmin"
                  value={formData.prodiAdmin}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                >
                  <option value="">Pilih Program Studi</option>
                  {prodiOptions.map((prodi, index) => (
                    <option key={index} value={prodi}>
                      {prodi}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Detail User Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium dark:text-white">
                Informasi Profil
              </h2>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Nomor HP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  placeholder="Contoh: 08123456789 atau +628123456789"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  NIP
                </label>
                <input
                  type="text"
                  name="nip"
                  value={formData.nip}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Jabatan
                </label>
                <input
                  type="text"
                  name="jabatan"
                  value={formData.jabatan}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Alamat
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Foto Profil
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                />

                {previewImage && (
                  <div className="mt-2">
                    <img
                      src={previewImage}
                      alt="Preview foto profil"
                      className="w-24 h-24 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Tambah Admin
            </button>

            <button
              type="button"
              onClick={() => navigate("/users/admin")}
              className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 text-sm font-semibold rounded-md shadow hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Layout;
