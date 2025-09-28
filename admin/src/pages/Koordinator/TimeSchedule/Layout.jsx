import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { useParams } from 'react-router-dom';

const TimeScheduleInput = () => {
  const { schoolId } = useParams();
  const [rabItems, setRabItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [progressValue, setProgressValue] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Generate weeks (1-24)
  const weeks = Array.from({ length: 24 }, (_, i) => i + 1);

  useEffect(() => {
    fetchRabItems();
  }, [schoolId, year]);

  const fetchRabItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/rab-items/school/${schoolId}`);
      if (response.data.success) {
        setRabItems(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedItem(response.data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching RAB items:', error);
      setMessage('Gagal memuat data RAB');
    }
  };

  const fetchProgressValue = async () => {
  if (!selectedItem) return;
  
  try {
    const response = await axios.get(
      `${API_URL}/time-schedules/item/${selectedItem}/week/${selectedWeek}/year/${year}`
    );
    
    if (response.data.success) {
      // Jika data ditemukan, gunakan plannedProgress, jika tidak, set ke 0
      setProgressValue(response.data.data ? response.data.data.plannedProgress : 0);
    } else {
      setProgressValue(0);
    }
  } catch (error) {
    // Jika error 404 (Not Found), set progress ke 0
    if (error.response && error.response.status === 404) {
      setProgressValue(0);
    } else {
      console.error('Error fetching progress value:', error);
      setMessage('Gagal memuat data progress');
    }
  }
};

  useEffect(() => {
    if (selectedItem) {
      fetchProgressValue();
    }
  }, [selectedItem, selectedWeek, year]);

  const handleSave = async () => {
    if (!selectedItem) {
      setMessage('Pilih item RAB terlebih dahulu');
      return;
    }

    setSaving(true);
    try {
      const response = await axios.post(`${API_URL}/time-schedules`, {
        rabItemId: selectedItem,
        weekNumber: selectedWeek,
        year: parseInt(year),
        plannedProgress: parseFloat(progressValue),
        schoolId: parseInt(schoolId)
      });

      if (response.data.success) {
        setMessage('Progress berhasil disimpan!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      setMessage('Gagal menyimpan progress');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAllWeeks = async () => {
    if (!selectedItem) {
      setMessage('Pilih item RAB terlebih dahulu');
      return;
    }

    setSaving(true);
    try {
      // Create an array of promises for all weeks
      const requests = weeks.map(week => 
        axios.post(`${API_URL}/time-schedules`, {
          rabItemId: selectedItem,
          weekNumber: week,
          year: parseInt(year),
          plannedProgress: parseFloat(progressValue),
          schoolId: parseInt(schoolId)
        })
      );

      // Execute all requests
      await Promise.all(requests);
      setMessage('Progress untuk semua minggu berhasil disimpan!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving progress for all weeks:', error);
      setMessage('Gagal menyimpan progress untuk semua minggu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">Input Time Schedule</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('Gagal') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
            <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Item Pekerjaan</label>
          <select
            value={selectedItem || ''}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {rabItems.map(item => (
              <option key={item.id} value={item.id}>
                {item.itemNo} - {item.uraian} ({item.bobot}%)
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Minggu Ke</label>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {weeks.map(week => (
              <option key={week} value={week}>Minggu {week}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Progress Rencana (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={progressValue}
            onChange={(e) => setProgressValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
        
        <button
          onClick={handleSaveAllWeeks}
          disabled={saving}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan untuk Semua Minggu'}
        </button>
      </div>
      
      {selectedItem && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Progress untuk {rabItems.find(item => item.id === selectedItem)?.uraian}</h3>
          <div className="grid grid-cols-6 gap-2">
            {weeks.map(week => (
              <div key={week} className="text-center p-2 border rounded">
                <div className="text-sm font-medium">Minggu {week}</div>
                <div className="text-lg font-bold">
                  {week === selectedWeek ? progressValue : '-'}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeScheduleInput;