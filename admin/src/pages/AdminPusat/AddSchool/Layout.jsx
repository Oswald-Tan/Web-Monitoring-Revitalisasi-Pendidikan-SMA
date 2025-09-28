import { useState, useEffect } from "react";
import { User, Locate, Shield, MapPin, Calendar, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { API_URL } from "../../../config";
import PropTypes from "prop-types";
import { HiOutlineUserPlus } from "react-icons/hi2";

// Reusable InputField component
const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-sm"
      />
    </div>
  </div>
);

const Layout = () => {
  const [name, setName] = useState("");
  const [kabupaten, setKabupaten] = useState("");
  const [location, setLocation] = useState("");
  const [nilaiBanper, setNilaiBanper] = useState("");
  const [durasi, setDurasi] = useState("");
  const [startDate, setStartDate] = useState("");
  const [finishDate, setFinishDate] = useState("");
  const [facilitator, setFacilitator] = useState("");
  const [facilitators, setFacilitators] = useState([]);
  const [loadingFacilitators, setLoadingFacilitators] = useState(true);
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const saveSchool = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/schools`, {
        name,
        kabupaten,
        location,
        nilaiBanper: parseFloat(nilaiBanper.replace(/\./g, "")),
        durasi: parseInt(durasi), // Konversi ke integer
        startDate,
        finishDate,
        facilitator_id: facilitator,
      });
      navigate("/super-admin/sekolah");
      Swal.fire("Success", "Sekolah berhasil ditambahkan", "success");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(() => {
    const fetchFacilitators = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/facilitators`);
        setFacilitators(res.data.data); 
      } catch (error) {
        console.error("Gagal mengambil fasilitator:", error);
      } finally {
        setLoadingFacilitators(false);
      }
    };

    fetchFacilitators();
  }, []);

  return (
    <div>
      <div className="space-y-6 w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
              <HiOutlineUserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Add New School
              </h2>
              <p className="text-sm text-gray-600">
                Create a new school profile to manage its data and progress.
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            <form onSubmit={saveSchool} className="space-y-6">
              {/* Error Message */}
              {msg && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm font-medium">
                    {msg}
                  </p>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Nama Sekolah"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama sekolah"
                    icon={User}
                  />

                  <InputField
                    label="Kabupaten"
                    value={kabupaten}
                    onChange={(e) => setKabupaten(e.target.value)}
                    placeholder="Masukkan kabupaten"
                    icon={MapPin}
                  />

                  <InputField
                    label="Lokasi"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Masukkan lokasi detail"
                    icon={Locate}
                  />

                  <InputField
                    label="Nilai Bantuan Pemerintah (Banper)"
                    value={nilaiBanper}
                    onChange={(e) => setNilaiBanper(formatCurrency(e.target.value))}
                    placeholder="Contoh: 2.603.593.000"
                    icon={DollarSign}
                  />

                  <InputField
                    label="Durasi (Hari)"
                    type="number"
                    value={durasi}
                    onChange={(e) => setDurasi(e.target.value)}
                    placeholder="Masukkan durasi dalam hari (contoh: 120)"
                    icon={Calendar}
                  />

                  <InputField
                    label="Tanggal Mulai"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    icon={Calendar}
                  />

                  <InputField
                    label="Tanggal Selesai"
                    type="date"
                    value={finishDate}
                    onChange={(e) => setFinishDate(e.target.value)}
                    icon={Calendar}
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Fasilitator
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        value={facilitator}
                        onChange={(e) => setFacilitator(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 appearance-none cursor-pointer text-sm"
                      >
                        <option value="">Pilih Fasilitator</option>
                        {loadingFacilitators ? (
                          <option disabled>Loading...</option>
                        ) : (
                          facilitators.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))
                        )}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Loading...
                    </>
                  ) : (
                    "Create School"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  icon: PropTypes.elementType.isRequired,
};

export default Layout;