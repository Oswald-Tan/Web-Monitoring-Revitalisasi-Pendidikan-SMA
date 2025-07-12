import PropTypes from "prop-types";
import { IoIosClose } from "react-icons/io";
import Swal from "sweetalert2";
import axios from "axios";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../../config";
import { useSelector } from "react-redux";
import Button from "../../../components/ui/Button";
import { BiArrowBack } from "react-icons/bi";
import { FaPrint, FaTrash, FaEdit, FaFileDownload } from "react-icons/fa";
import { MdAssignment, MdUpdate, MdDescription } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi";

const statusOptions = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800" },
  {
    value: "menunggu_persetujuan",
    label: "Menunggu Persetujuan",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "disetujui",
    label: "Disetujui",
    color: "bg-green-100 text-green-800",
  },
  { value: "ditolak", label: "Ditolak", color: "bg-red-100 text-red-800" },
  {
    value: "selesai",
    label: "Selesai",
    color: "bg-indigo-100 text-indigo-800",
  },
];

const Layout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [surat, setSurat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDisposisiModal, setShowDisposisiModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchSurat = async () => {
      try {
        const response = await axios.get(`${API_URL}/surat/${id}`);
        setSurat(response.data);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setError("Gagal memuat data surat");
        setLoading(false);
      }
    };

    fetchSurat();
  }, [id]);

  const handleDelete = async () => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Surat akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg px-4 py-2",
        cancelButton: "rounded-lg px-4 py-2 ml-2",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/surat/${id}`);
          Swal.fire({
            title: "Terhapus!",
            text: "Surat berhasil dihapus.",
            icon: "success",
            customClass: {
              popup: "rounded-xl",
            },
          });
          navigate("/surat/list");
        } catch (err) {
          console.log(err);
          Swal.fire({
            title: "Gagal!",
            text: "Surat gagal dihapus.",
            icon: "error",
            customClass: {
              popup: "rounded-xl",
            },
          });
        }
      }
    });
  };

  const handleDownload = () => {
    window.open(`${API_URL}/surat/${id}/download`, "_blank");
  };

  const handleCetak = async () => {
    try {
      const response = await axios.get(`${API_URL}/surat/${id}/cetak`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(blob);

      const printWindow = window.open(pdfUrl);

      if (!printWindow) {
        Swal.fire({
          title: "Error!",
          text: "Izinkan popup untuk mencetak dokumen",
          icon: "error",
          customClass: {
            popup: "rounded-xl",
          },
        });
        return;
      }

      printWindow.onload = () => {
        printWindow.print();
      };
    } catch (error) {
      let errorMessage = "Gagal mencetak dokumen";

      if (error.response) {
        if (error.response.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const text = reader.result;
              const errorObj = JSON.parse(text);
              errorMessage = errorObj.message || errorMessage;
            } catch {
              errorMessage = "Terjadi kesalahan pada server";
            }
            Swal.fire({
              title: "Error!",
              text: errorMessage,
              icon: "error",
              customClass: {
                popup: "rounded-xl",
              },
            });
          };
          reader.readAsText(error.response.data);
        } else {
          errorMessage = error.response.data.message || errorMessage;
          Swal.fire({
            title: "Error!",
            text: errorMessage,
            icon: "error",
            customClass: {
              popup: "rounded-xl",
            },
          });
        }
      } else {
        Swal.fire({
          title: "Error!",
          text: errorMessage,
          icon: "error",
          customClass: {
            popup: "rounded-xl",
          },
        });
      }

      console.error("Cetak error:", error);
    }
  };

  const handleUpdateDisposisi = (disposisi) => {
    setSurat({ ...surat, disposisi });
    setShowDisposisiModal(false);
  };

  const handleUpdateStatus = (status) => {
    setSurat({ ...surat, status });
    setShowStatusModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  if (!surat) {
    return <div className="text-center py-10">Surat tidak ditemukan</div>;
  }

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const getStatus = () => {
    return statusOptions.find((option) => option.value === surat.status);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <button
            onClick={() => navigate("/surat/list")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <BiArrowBack className="mr-2" />
            <span>Kembali ke Daftar Surat</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mt-2 dark:text-white">
            Detail Surat
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              getStatus().color
            }`}
          >
            {getStatus().label}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <div className="flex items-center mb-2">
                <HiOutlineDocumentText className="text-indigo-600 text-xl mr-2" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {surat.nomor_surat}
                </h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {surat.perihal}
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <div className="flex flex-wrap gap-2">
                <Button
                  icon={<FaFileDownload />}
                  text="Download"
                  onClick={handleDownload}
                  className={"bg-violet-600 hover:bg-violet-700"}
                />
                <Button
                  icon={<FaPrint />}
                  text="Cetak"
                  onClick={handleCetak}
                   className={"bg-yellow-600 hover:bg-yellow-700"}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Jenis Surat
                </h3>
                <p className="text-lg font-medium dark:text-white">
                  {surat.jenis_surat === "masuk"
                    ? "Surat Masuk"
                    : "Surat Keluar"}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Tanggal Surat
                </h3>
                <p className="text-lg font-medium dark:text-white">
                  {formatDate(surat.tanggal_surat)}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {surat.jenis_surat === "masuk"
                    ? "Asal Surat"
                    : "Tujuan Surat"}
                </h3>
                <p className="text-lg font-medium dark:text-white">
                  {surat.asal_tujuan}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Pembuat
                </h3>
                <p className="text-lg font-medium dark:text-white">
                  {surat.user?.username || "-"}
                </p>
              </div>
            </div>

            {surat.disposisi && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <MdAssignment className="text-teal-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Disposisi
                  </h3>
                </div>
                <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                  <p className="dark:text-white whitespace-pre-line">
                    {surat.disposisi}
                  </p>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center mb-3">
                <MdDescription className="text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  File Surat
                </h3>
              </div>
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-3">
                    <HiOutlineDocumentText className="text-indigo-600 text-xl" />
                  </div>
                  <span className="text-gray-800 dark:text-white">
                    {surat.file_path.split("/").pop()}
                  </span>
                </div>
                <button
                  onClick={handleDownload}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  <FaFileDownload className="mr-1" /> Unduh
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Aksi Surat
              </h3>
              <div className="space-y-3">
                {user.role.includes("admin") && (
                  <>
                    <Button
                      icon={<FaEdit />}
                      text="Edit Surat"
                      onClick={() => navigate(`/surat/edit/${id}`)}
                      className={"bg-orange-600 hover:bg-orange-700 w-full"}
                    />
                    <Button
                      icon={<MdAssignment />}
                      text="Update Disposisi"
                      onClick={() => setShowDisposisiModal(true)}
                       className={"bg-blue-600 hover:bg-blue-700 w-full"}
                    />
                    <Button
                      icon={<MdUpdate />}
                      text="Update Status"
                      onClick={() => setShowStatusModal(true)}
                       className={"bg-green-600 hover:bg-green-700 w-full"}
                    />
                    <Button
                      icon={<FaTrash />}
                      text="Hapus Surat"
                      onClick={handleDelete}
                       className={"bg-red-600 hover:bg-red-700 w-full"}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 bg-gray-50 dark:bg-gray-750 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Status Surat
              </h3>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <span
                    key={status.value}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      surat.status === status.value
                        ? status.color
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {status.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Disposisi */}
      {showDisposisiModal && (
        <ModalDisposisi
          isOpen={showDisposisiModal}
          handleClose={() => setShowDisposisiModal(false)}
          suratId={id}
          initialDisposisi={surat.disposisi}
          onSuccess={handleUpdateDisposisi}
        />
      )}

      {/* Modal Status */}
      {showStatusModal && (
        <ModalStatus
          isOpen={showStatusModal}
          handleClose={() => setShowStatusModal(false)}
          suratId={id}
          initialStatus={surat.status}
          onSuccess={handleUpdateStatus}
        />
      )}
    </div>
  );
};

const ModalDisposisi = ({
  isOpen,
  handleClose,
  suratId,
  initialDisposisi,
  onSuccess,
}) => {
  const [disposisi, setDisposisi] = useState(initialDisposisi || "");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (initialDisposisi) {
      setDisposisi(initialDisposisi);
    }
  }, [initialDisposisi]);

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
      Swal.fire({
        title: "Berhasil!",
        text: "Disposisi berhasil diperbarui",
        icon: "success",
        customClass: {
          popup: "rounded-xl",
        },
      });
      onSuccess(disposisi);
      handleClose();
    } catch (error) {
      Swal.fire({
        title: "Gagal!",
        text: error.response?.data?.message || "Terjadi kesalahan",
        icon: "error",
        customClass: {
          popup: "rounded-xl",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-5 transition-opacity duration-300">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 relative animate-scaleIn">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <IoIosClose size={28} />
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mb-4">
            <MdAssignment className="text-teal-600 text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Update Disposisi
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Tambahkan atau edit disposisi untuk surat ini
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Isi Disposisi <span className="text-red-500">*</span>
            </label>
            <textarea
              value={disposisi}
              onChange={(e) => setDisposisi(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-750 dark:text-white"
              rows="5"
              placeholder="Masukkan disposisi..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 focus:ring-4 focus:ring-teal-200 dark:focus:ring-teal-800 transition-colors disabled:opacity-70"
            >
              {loading ? (
                "Loading..."
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ModalStatus = ({
  isOpen,
  handleClose,
  suratId,
  initialStatus,
  onSuccess,
}) => {
  const [status, setStatus] = useState(initialStatus || "draft");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus);
    }
  }, [initialStatus]);

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
      Swal.fire({
        title: "Berhasil!",
        text: "Status surat berhasil diperbarui",
        icon: "success",
        customClass: {
          popup: "rounded-xl",
        },
      });
      onSuccess(status);
      handleClose();
    } catch (error) {
      Swal.fire({
        title: "Gagal!",
        text: error.response?.data?.message || "Terjadi kesalahan",
        icon: "error",
        customClass: {
          popup: "rounded-xl",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-5 transition-opacity duration-300">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 relative animate-scaleIn">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <IoIosClose size={28} />
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
            <MdUpdate className="text-yellow-600 text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Update Status Surat
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Pilih status baru untuk surat ini
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-750 dark:text-white"
              required
            >
              <option value="">Pilih Status</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {statusOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => setStatus(option.value)}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    status === option.value
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        option.color.split(" ")[0]
                      }`}
                    ></div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {option.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-4 focus:ring-yellow-200 dark:focus:ring-yellow-800 transition-colors disabled:opacity-70"
            >
              {loading ? (
               "Loading..."
              ) : (
                "Update Status"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ModalDisposisi.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  suratId: PropTypes.string.isRequired,
  initialDisposisi: PropTypes.string,
  onSuccess: PropTypes.func.isRequired,
};

ModalStatus.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  suratId: PropTypes.string.isRequired,
  initialStatus: PropTypes.string,
  onSuccess: PropTypes.func.isRequired,
};

export default Layout;
