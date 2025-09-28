import React, { useState, useEffect } from "react";
import { MapPin, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { MdRemoveRedEye } from "react-icons/md";
import ButtonAction from "../../../components/ui/ButtonAction";
import Swal from "sweetalert2";
import axios from "axios";
import { API_URL } from "../../../config";
import { LuSchool } from "react-icons/lu";

const Layout = () => {
  const [schools, setSchools] = useState([]);
  const [message] = useState("");
  const [loading, setLoading] = useState(false);

  // Status icons
  const statusIcons = {
    "on-track": <CheckCircle className="w-4 h-4 text-green-600" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
    delayed: <Clock className="w-4 h-4 text-red-600" />,
    completed: <CheckCircle className="w-4 h-4 text-blue-600" />,
  };

  useEffect(() => {
    getSchools();
  }, []);

  const getSchools = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/schools/my-school`);
      if (res.data && res.data.data) {
        setSchools(res.data.data || []);
      }
    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Daftar Sekolah
            </h2>
            <p className="text-sm text-gray-600">
              Manage and monitor schools
            </p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className="overflow-x-auto relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50/50 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                  <div className="flex items-center">#</div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                  <div className="flex items-center">Nama Sekolah</div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                  <div className="flex items-center">Lokasi</div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                  <div className="flex items-center">Progress</div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                  <div className="flex items-center">Fasilitator</div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                  <div className="flex items-center">Status</div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">
                  <div className="flex items-center">Actions</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schools.length > 0 ? (
                schools.map((school, index) => (
                  <tr
                    key={school.id}
                    className="text-sm hover:bg-gray-50 transition-colors duration-150 group"
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {school.name}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{school.location}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className={`h-2 rounded-full  ${
                              school.progress >= 70
                                ? "bg-green-600"
                                : school.progress >= 50
                                ? "bg-yellow-600"
                                : "bg-red-600"
                            }`}
                            style={{ width: `${school.progress}%` }}
                          ></div>
                        </div>
                        <span>{school.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-gray-600">
                      <div className="text-sm font-medium text-gray-900">
                        {school.facilitator_name}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        {statusIcons[school.status]}
                        <span className="ml-2 capitalize">
                          {school.status.replace("-", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <ButtonAction
                          to={`/admin-sekolah/detail/sekolah/${school.id}`}
                          icon={<MdRemoveRedEye />}
                          className={"bg-blue-600 hover:bg-blue-700"}
                          tooltip="Lihat"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <LuSchool className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          No shools found
                        </h3>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Message */}
      {message && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm font-medium">
            {message}
          </p>
        </div>
      )}
    </div>
  );
};

export default Layout;
