import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../../config";
import Swal from "sweetalert2";

const Layout = () => {
  const prodiOptions = [
    "D3 Administrasi Bisnis",
    "D3 Manajemen Pemasaran",
    "D4 Manajemen Bisnis",
  ];

  const [formData, setFormData] = useState({
    // User data
    username: "",
    password: "",
    confirmPassword: "",
    role: "",
    status: "active",
    prodiAdmin: "",

    // Detail user data
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
  const { id } = useParams();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/user-details/${id}`);
        const { user, detail } = res.data;

        setFormData({
          username: user.username,
          password: "",
          confirmPassword: "",
          role: user.role || "",
          status: user.status,
          prodiAdmin: user.prodiAdmin || "",

          fullname: detail?.fullname || "",
          email: detail?.email || "",
          phone_number: detail?.phone_number || "",
          nip: detail?.nip || "",
          jabatan: detail?.jabatan || "",
          address: detail?.address || "",
          photo_profile: detail?.photo_profile || null,
        });

        console.log(res.data);

        if (detail?.photo_profile) {
          setPreviewImage(`${API_URL}/${detail.photo_profile}`);
        }
      } catch (error) {
        console.error("Error details:", error.response);
        setMsg(error.response?.data?.message || "Error loading user data");
      }
    };

    fetchUserData();
  }, [id]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi password
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMsg("Password and confirmation password do not match");
      return;
    }

    try {
      const formPayload = new FormData();

      // Append user data
      formPayload.append("username", formData.username);
      if (formData.password) {
        formPayload.append("password", formData.password);
        formPayload.append("confirmPassword", formData.confirmPassword);
      }
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

      // Append file hanya jika ada file baru
      if (formData.photo_profile instanceof File) {
        formPayload.append("photo_profile", formData.photo_profile);
      }

      await axios.patch(
        `${API_URL}/users/user/${id}/edit-admin-prodi`,
        formPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "User data updated successfully",
      }).then(() => {
        navigate("/users/admin");
      });
    } catch (error) {
      // Tampilkan error lebih spesifik
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Update failed";
      setMsg(errorMsg);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-black-100 dark:text-white mb-4">
        Edit User
      </h1>

      <div className="bg-white dark:bg-[#282828] p-6 rounded-lg shadow-md">
        {msg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium dark:text-white">
                Account Information
              </h2>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Username
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
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                   className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                   className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                   className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="staf_tu">Staf Tata Usaha</option>
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
                Profile Information
              </h2>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                   className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                   className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                   className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] sm:text-sm"
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
                  Address
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
                  Profile Photo
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
                      alt="Profile preview"
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
              Update User
            </button>

            <button
              type="button"
              onClick={() => navigate("/users/admin")}
              className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 text-sm font-semibold rounded-md shadow hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Layout;
