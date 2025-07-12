import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "menunggu_persetujuan", label: "Menunggu Persetujuan" },
  { value: "disetujui", label: "Disetujui" },
  { value: "ditolak", label: "Ditolak" },
  { value: "selesai", label: "Selesai" },
];

const Layout = ({ suratId, initialStatus, onSuccess, onCancel }) => {
  const [status, setStatus] = useState(initialStatus || "draft");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        `${API_URL}/surat/${suratId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      Swal.fire("Berhasil!", "Status surat berhasil diperbarui", "success");
      onSuccess(status);
    } catch (error) {
      Swal.fire(
        "Gagal!",
        error.response?.data?.message || "Terjadi kesalahan",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Status Surat
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-[#333333] dark:text-white"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          disabled={loading}
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default Layout;