import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import {
  User,
  UserPlus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

const Layout = () => {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    user_id: "",
    qualifications: "",
    certifications: "",
    zone: "",
    assigned_schools: "",
    cv_path: "",
    additional_info: "",
  });

  useEffect(() => {
    fetchPersonnel();
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/personnel`, {
        params: {
          search: searchTerm,
          role: filterRole,
        },
      });
      setPersonnel(response.data.data);
    } catch (error) {
      console.error("Error fetching personnel:", error);
      Swal.fire("Error", "Gagal mengambil data personel", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/personnel`);
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_URL}/roles`);
      setRoles(response.data.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPersonnel();
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilterRole("");
    fetchPersonnel();
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data personel akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/personnel/${id}`);
        Swal.fire("Berhasil!", "Personel berhasil dihapus.", "success");
        fetchPersonnel();
      } catch (error) {
        console.error("Error deleting personnel:", error);
        Swal.fire("Error", "Gagal menghapus personel", "error");
      }
    }
  };

  const handleEdit = (person) => {
    setSelectedPersonnel(person);
    setFormData({
      user_id: person.user_id,
      qualifications: person.qualifications || "",
      certifications: person.certifications || "",
      zone: person.zone || "",
      assigned_schools: person.assigned_schools || "",
      cv_path: person.cv_path || "",
      additional_info: person.additional_info || "",
    });
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setFormData({
      user_id: "",
      qualifications: "",
      certifications: "",
      zone: "",
      assigned_schools: "",
      cv_path: "",
      additional_info: "",
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (showAddModal) {
        await axios.post(`${API_URL}/personnel`, formData);
        Swal.fire("Berhasil!", "Personel berhasil ditambahkan.", "success");
      } else {
        await axios.put(
          `${API_URL}/personnel/${selectedPersonnel.id}`,
          formData
        );
        Swal.fire("Berhasil!", "Personel berhasil diperbarui.", "success");
      }
      setShowAddModal(false);
      setShowEditModal(false);
      fetchPersonnel();
    } catch (error) {
      console.error("Error saving personnel:", error);
      Swal.fire("Error", "Gagal menyimpan data personel", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const exportToCSV = () => {
    const headers = "Nama,Email,Role,Kualifikasi,Sertifikasi,Zona Tugas\n";
    const csvContent = personnel
      .map(
        (person) =>
          `"${person.User?.name || ""}","${person.User?.email || ""}","${
            person.User?.Role?.name || ""
          }","${person.qualifications || ""}","${
            person.certifications || ""
          }","${person.zone || ""}"`
      )
      .join("\n");

    const blob = new Blob([headers + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "daftar_personel.csv");
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            Profil Personel
          </h2>
          <p className="text-sm text-gray-600">
            Kelola data personel dan tim revitalisasi sekolah
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Personel</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari Personel
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama, kualifikasi, zona..."
                className="pl-10 w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter Role
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="pl-10 w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md cursor-pointer"
              >
                <option value="">Semua Role</option>
                {roles
                  .filter(
                    (role) =>
                      role.role_name !== "admin_pusat" &&
                      role.role_name !== "super_admin"
                  )
                  .map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex items-end space-x-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Terapkan Filter
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={exportToCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Download className="w-4 h-4 mr-1" />
              CSV
            </button>
          </div>
        </form>
      </div>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personnel.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada data personel</p>
          </div>
        ) : (
          personnel.map((person) => (
            <div
              key={person.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-bold text-gray-800">
                    {person.User?.name}
                  </h3>
                  <p className="text-sm text-blue-600">
                    {person.User?.Role?.name}
                  </p>
                  <p className="text-xs text-gray-500">{person.User?.email}</p>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">
                    Kualifikasi
                  </p>
                  <p className="text-gray-600">
                    {person.qualifications || "-"}
                  </p>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">
                    Sertifikasi
                  </p>
                  <p className="text-gray-600">
                    {person.certifications || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Zona Tugas
                  </p>
                  <p className="text-gray-600">
                    {person.zone || "-"}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 flex justify-between">
                <button
                  onClick={() => handleEdit(person)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(person.id)}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop with opacity */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowAddModal(false)}
          />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 scale-100">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Tambah Personel
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Modal Body */}
              <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pilih User
                    </label>
                    <select
                      name="user_id"
                      value={formData.user_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Pilih User</option>
                      {users
                        .filter(
                          (user) =>
                            user.userRole && // Ganti dari user.Role
                            user.userRole.role_name !== "admin_pusat" &&
                            user.userRole.role_name !== "super_admin"
                        )
                        .map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} - {user.userRole?.role_name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kualifikasi
                    </label>
                    <textarea
                      name="qualifications"
                      value={formData.qualifications}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sertifikasi
                    </label>
                    <textarea
                      name="certifications"
                      value={formData.certifications}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zona Tugas
                    </label>
                    <input
                      type="text"
                      name="zone"
                      value={formData.zone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop with opacity */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowEditModal(false)}
          />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 scale-100">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Personel
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kualifikasi
                    </label>
                    <textarea
                      name="qualifications"
                      value={formData.qualifications}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sertifikasi
                    </label>
                    <textarea
                      name="certifications"
                      value={formData.certifications}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zona Tugas
                    </label>
                    <input
                      type="text"
                      name="zone"
                      value={formData.zone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
