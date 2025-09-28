import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import {
  Save,
  User,
  Users,
  Building2,
  AlertCircle,
  Shield,
  Plus,
} from "lucide-react";
import Swal from "sweetalert2";

const Layout = () => {
  const [facilitators, setFacilitators] = useState([]);
  const [schoolAdmins, setSchoolAdmins] = useState([]);
  const [schools, setSchools] = useState([]);
  const [facilitatorAssignments, setFacilitatorAssignments] = useState({});
  const [adminAssignments, setAdminAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("facilitator-assignments");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facilitatorsRes, schoolsRes, adminsRes] = await Promise.all([
        axios.get(`${API_URL}/assignments/assignable-users?role=4`),
        axios.get(`${API_URL}/assignments/schools`),
        axios.get(`${API_URL}/assignments/assignable-users?role=5`),
      ]);

      setFacilitators(facilitatorsRes.data.data);
      setSchools(schoolsRes.data.data);
      setSchoolAdmins(adminsRes.data.data);

      // Initialize assignments state with current assignments
      const initialFacilitatorAssignments = {};
      const initialAdminAssignments = {};

      schoolsRes.data.data.forEach((school) => {
        initialFacilitatorAssignments[school.id] = school.facilitator
          ? school.facilitator.id
          : null;

        initialAdminAssignments[school.id] = school.admin
          ? school.admin.id
          : null;
      });

      setFacilitatorAssignments(initialFacilitatorAssignments);
      setAdminAssignments(initialAdminAssignments);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Error", "Gagal mengambil data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFacilitatorAssignmentChange = (schoolId, facilitatorId) => {
    const value = facilitatorId === "" ? null : parseInt(facilitatorId);
    setFacilitatorAssignments((prev) => ({
      ...prev,
      [schoolId]: value,
    }));
  };

  const handleAdminAssignmentChange = (schoolId, adminId) => {
    const value = adminId === "" ? null : parseInt(adminId);
    setAdminAssignments((prev) => ({
      ...prev,
      [schoolId]: value,
    }));
  };

  const handleSaveFacilitatorAssignments = async () => {
    try {
      setSaving(true);

      const assignmentsData = Object.entries(facilitatorAssignments)
        .filter(([, facilitatorId]) => facilitatorId !== null)
        .map(([schoolId, facilitatorId]) => ({
          schoolId: parseInt(schoolId),
          userId: facilitatorId,
        }));

      const response = await axios.post(
        `${API_URL}/assignments/bulk-assign-facilitators`,
        {
          assignments: assignmentsData,
        }
      );

      if (response.data.success) {
        Swal.fire(
          "Berhasil!",
          "Pembagian tugas fasilitator berhasil disimpan",
          "success"
        );
        fetchData();
      }
    } catch (error) {
      console.error("Error saving facilitator assignments:", error);
      Swal.fire(
        "Error",
        "Gagal menyimpan pembagian tugas fasilitator",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAdminAssignments = async () => {
    try {
      setSaving(true);

      const assignmentsData = Object.entries(adminAssignments)
        .filter(([, adminId]) => adminId !== null)
        .map(([schoolId, adminId]) => ({
          schoolId: parseInt(schoolId),
          adminId: adminId,
        }));

      const response = await axios.post(
        `${API_URL}/assignments/bulk-assign-admins`,
        {
          assignments: assignmentsData,
        }
      );

      if (response.data.success) {
        Swal.fire(
          "Berhasil!",
          "Pembagian admin sekolah berhasil disimpan",
          "success"
        );
        fetchData();
      }
    } catch (error) {
      console.error("Error saving admin assignments:", error);
      if (error.response?.status === 400) {
        Swal.fire(
          "Error",
          "Beberapa admin telah ditugaskan ke lebih dari satu sekolah. Silakan periksa kembali penugasan.",
          "error"
        );
      } else {
        Swal.fire("Error", "Gagal menyimpan pembagian admin sekolah", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const getUserName = (userId, userList) => {
    if (!userId) return "Belum ditugaskan";

    const id = parseInt(userId);
    const user = userList.find((u) => u.id === id);

    return user ? user.name : "Tidak diketahui";
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">
            Pembagian Tugas
          </h2>
          <p className="text-sm text-gray-600">
            Kelola penugasan user ke sekolah
          </p>
        </div>

        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => setActiveTab("facilitator-assignments")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "facilitator-assignments"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Penugasan Fasilitator
          </button>
          <button
            onClick={() => setActiveTab("admin-assignments")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "admin-assignments"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Penugasan Admin Sekolah
          </button>
        </div>
      </div>

      {activeTab === "facilitator-assignments" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Facilitator List */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              <h3 className="text-lg font-semibold">Daftar Fasilitator</h3>
            </div>
            <div className="space-y-4">
              {facilitators.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Tidak ada data fasilitator
                </div>
              ) : (
                facilitators.map((facilitator) => (
                  <div
                    key={facilitator.id}
                    className="p-4 border border-gray-300 rounded-lg bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">
                          {facilitator.name}
                        </span>
                        <div className="text-xs text-gray-500">
                          {facilitator.email}
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {facilitator.current}/{facilitator.max} sekolah
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (facilitator.current / facilitator.max) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    {facilitator.current >= facilitator.max && (
                      <div className="flex items-center mt-2 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        <span>Batas maksimum tercapai</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* School Assignment for Facilitators */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            <div className="flex items-center mb-4">
              <Building2 className="w-5 h-5 mr-2 text-green-600" />
              <h3 className="text-lg font-semibold">
                Penugasan Fasilitator ke Sekolah
              </h3>
            </div>

            {schools.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Tidak ada data sekolah</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schools.map((school) => (
                  <div
                    key={school.id}
                    className="p-4 border border-gray-300 rounded-lg bg-gray-50"
                  >
                    <div className="font-medium mb-2">
                      {school.name}
                    </div>
                    {school.kabupaten && (
                      <div className="text-xs text-gray-500 mb-2">
                        {school.kabupaten}
                      </div>
                    )}

                    <div className="mb-3">
                      <div className="text-xs text-gray-500">
                        Fasilitator:
                      </div>
                      <div className="text-sm font-medium">
                        {getUserName(
                          facilitatorAssignments[school.id],
                          facilitators
                        )}
                      </div>
                    </div>

                    <select
                      value={facilitatorAssignments[school.id] || ""}
                      onChange={(e) =>
                        handleFacilitatorAssignmentChange(
                          school.id,
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    >
                      <option value="">Pilih fasilitator...</option>
                      {facilitators.map((facilitator) => (
                        <option
                          key={facilitator.id}
                          value={facilitator.id}
                          disabled={facilitator.current >= facilitator.max}
                        >
                          {facilitator.name}
                          {facilitator.current >= facilitator.max && " (Penuh)"}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveFacilitatorAssignments}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                <span>
                  {saving ? "Menyimpan..." : "Simpan Pembagian Tugas"}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Admin List */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                <h3 className="text-lg font-semibold">Daftar Admin Sekolah</h3>
              </div>
            </div>
            <div className="space-y-4">
              {schoolAdmins.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Tidak ada data admin sekolah
                </div>
              ) : (
                schoolAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    className="p-4 border border-gray-300 rounded-lg bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">
                          {admin.name}
                        </span>
                        <div className="text-xs text-gray-500">
                          {admin.email}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {admin.assignedSchool || "Belum ditugaskan ke sekolah"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* School Assignment for Admins */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            <div className="flex items-center mb-4">
              <Building2 className="w-5 h-5 mr-2 text-green-600" />
              <h3 className="text-lg font-semibold">
                Penugasan Admin ke Sekolah
              </h3>
            </div>

            {schools.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Tidak ada data sekolah</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schools.map((school) => (
                  <div
                    key={school.id}
                    className="p-4 border border-gray-300 rounded-lg bg-gray-50"
                  >
                    <div className="font-medium mb-2">
                      {school.name}
                    </div>
                    {school.kabupaten && (
                      <div className="text-xs text-gray-500 mb-2">
                        {school.kabupaten}
                      </div>
                    )}

                    <div className="mb-3">
                      <div className="text-xs text-gray-500">
                        Admin Sekolah:
                      </div>
                      <div className="text-sm font-medium">
                        {getUserName(adminAssignments[school.id], schoolAdmins)}
                      </div>
                    </div>

                    <select
                      value={adminAssignments[school.id] || ""}
                      onChange={(e) =>
                        handleAdminAssignmentChange(school.id, e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    >
                      <option value="">Pilih admin sekolah...</option>
                      {schoolAdmins.map((admin) => {
                        const isAssignedElsewhere = Object.entries(
                          adminAssignments
                        ).some(
                          ([sId, aId]) =>
                            sId !== school.id.toString() && aId === admin.id
                        );
                        return (
                          <option
                            key={admin.id}
                            value={admin.id}
                            disabled={isAssignedElsewhere}
                          >
                            {admin.name}
                            {isAssignedElsewhere &&
                              " (Sudah ditugaskan di sekolah lain)"}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveAdminAssignments}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                <span>
                  {saving ? "Menyimpan..." : "Simpan Pembagian Admin"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
