import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

const Layout = ({ suratId, initialDisposisi, onSuccess, onCancel }) => {
  const [disposisi, setDisposisi] = useState(initialDisposisi || "");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/surat/${suratId}/disposisi`,
        { disposisi },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      Swal.fire("Berhasil!", "Disposisi berhasil diperbarui", "success");
      onSuccess(disposisi);
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
          Isi Disposisi
        </label>
        <textarea
          value={disposisi}
          onChange={(e) => setDisposisi(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-[#333333] dark:text-white"
          rows="4"
          placeholder="Masukkan disposisi..."
        />
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
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default Layout;