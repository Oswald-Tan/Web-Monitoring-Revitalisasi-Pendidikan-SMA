import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../config';
import Swal from 'sweetalert2';

const EventNotifications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Ambil detail event
        const eventResponse = await axios.get(`${API_URL}/event/${id}`);
        // Ambil data notifikasi (attendance dengan reminder_sent)
        const notificationsResponse = await axios.get(`${API_URL}/event/${id}/notifications`);
        
        setEvent(eventResponse.data);
        setNotifications(notificationsResponse.data);
        setError('');
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Gagal memuat data notifikasi');
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Gagal memuat data notifikasi',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold dark:text-white">
          Status Notifikasi - {event?.title || 'Event'}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm"
        >
          Kembali
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mt-5 overflow-x-auto bg-white dark:bg-[#282828] rounded-xl p-4 shadow-md">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-[#3f3f3f]">
          <thead>
            <tr className="text-sm dark:text-white">
              <th className="px-4 py-3 text-left font-medium">No</th>
              <th className="px-4 py-3 text-left font-medium">Nama Peserta</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Status Reminder</th>
              <th className="px-4 py-3 text-left font-medium">Terakhir Diupdate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#3f3f3f]">
            {notifications.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Tidak ada data notifikasi
                </td>
              </tr>
            ) : (
              notifications.map((notification, index) => (
                <tr key={notification.id} className="text-sm dark:text-white hover:bg-gray-50 dark:hover:bg-[#333333]">
                  <td className="px-4 py-3 whitespace-nowrap">{index + 1}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{notification.user?.fullname || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{notification.user?.email || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      notification.reminder_sent 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {notification.reminder_sent ? 'Terkirim' : 'Belum dikirim'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {notification.updated_at 
                      ? new Date(notification.updated_at).toLocaleString() 
                      : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventNotifications;