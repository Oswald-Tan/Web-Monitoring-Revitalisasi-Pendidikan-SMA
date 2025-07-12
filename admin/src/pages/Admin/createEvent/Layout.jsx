import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../../config";
import Swal from "sweetalert2";

const tipeKegiatanOptions = ["Meeting", "Event", "Workshop"];

const Layout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    location: "",
    type: "Meeting",
    participants: [],
  });

  const [msg, setMsg] = useState("");

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const localDateTime = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    return localDateTime.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        // Ambil daftar dosen dan admin jurusan
        const [dosenResponse, adminResponse] = await Promise.all([
          axios.get(`${API_URL}/users/by-role?role=dosen`),
          axios.get(`${API_URL}/users/by-role?role=admin`),
        ]);

        const combinedUsers = [...dosenResponse.data, ...adminResponse.data];

        setParticipants(combinedUsers);

        // Jika edit mode, ambil data event
        if (id) {
          const eventResponse = await axios.get(`${API_URL}/event/${id}`);
          const event = eventResponse.data;

          setFormData({
            title: event.title,
            description: event.description,
            start: formatDateForInput(event.start),
            end: formatDateForInput(event.end),
            location: event.location,
            type: event.type,
            participants: event.attendances?.map((a) => a.user_id) || [],
          });
        }

        setLoading(false);
      } catch (error) {
        setMsg("Gagal memuat data peserta");
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleParticipantChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value)
    );
    setFormData((prev) => ({ ...prev, participants: selectedOptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    // Format data untuk backend
    const eventData = {
      ...formData,
      start: new Date(formData.start).toISOString(),
      end: new Date(formData.end).toISOString(),
    };

    try {
        await axios.post(`${API_URL}/event`, eventData);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Kegiatan berhasil dibuat",
        });
      
      navigate("/events/list");
    } catch (error) {
      let errorMsg = "Terjadi kesalahan saat menyimpan data";

      if (error.response) {
        errorMsg =
          error.response.data.message ||
          error.response.data.error ||
          `Error ${error.response.status}`;
      }

      setMsg(errorMsg);
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-black-100 dark:text-white mb-4">
       Buat Event Baru
      </h1>

      <div className="mt-5 overflow-x-auto bg-white dark:bg-[#282828] rounded-xl p-4 shadow-md relative">
        {msg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Judul Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none sm:text-sm border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Tipe Kegiatan <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none sm:text-sm border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6]"
                required
              >
                <option value="">Pilih Tipe Kegiatan</option>
                {tipeKegiatanOptions.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Waktu Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="start"
                value={formData.start}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none sm:text-sm border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6]"
                placeholder="Contoh: 08123456789 atau +628123456789"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">
                Waktu Selesai <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="end"
                value={formData.end}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none sm:text-sm border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6]"
                placeholder="Contoh: 08123456789 atau +628123456789"
                required
              />
            </div>

            
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium dark:text-white mb-1 mt-6">
                Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none sm:text-sm border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6]"
                required
              />
            </div>

            <div >
              <label className="block text-sm font-medium dark:text-white mb-1">
                Deskripsi Kegiatan <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none sm:text-sm border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6]"
                required
              />
            </div>

            {/* Peserta Kegiatan - Menggunakan seluruh lebar */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium dark:text-white mb-1">
                Peserta Kegiatan <span className="text-red-500">*</span>
              </label>
              <select
                multiple
                name="participants"
                value={formData.participants}
                onChange={handleParticipantChange}
                className="w-full px-3 py-3 border dark:text-white rounded-md focus:outline-none sm:text-sm border-gray-200 dark:border-[#3f3f3f] dark:bg-[#3f3f3f] bg-[#f3f4f6] min-h-[150px]"
                required
              >
                {participants.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullname} -{" "}
                    {user.role === "dosen" ? "Dosen" : "Admin"}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Gunakan Ctrl/Cmd + klik untuk memilih beberapa peserta
              </p>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {id ? "Menyimpan..." : "Membuat..."}
                </span>
              ) : id ? (
                "Update"
              ) : (
                "Buat Kegiatan"
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/events/list")}
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