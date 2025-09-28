import React, { useState } from 'react';
import { Mail, Phone, Clock, Loader, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const Kontak = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nama minimal 2 karakter';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Pesan wajib diisi';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Pesan minimal 10 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitStatus(null);

    try {
      const response = await axios.post(`${API_URL}/contact/submit`, formData);
      
      if (response.data.success) {
        setSubmitStatus({
          type: 'success',
          message: response.data.message
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          message: ''
        });
        setErrors({});
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      
      if (error.response?.data?.errors) {
        // Handle validation errors from server
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.field] = err.message;
        });
        setErrors(serverErrors);
        
        setSubmitStatus({
          type: 'error',
          message: 'Terdapat kesalahan dalam pengisian form'
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: error.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi nanti.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors";
    const errorClass = errors[fieldName] 
      ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-200";
    
    return `${baseClass} ${errorClass}`;
  };

  return (
    <section id="kontak" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Hubungi Kami</h2>
          <p className="text-xl text-gray-600">
            Butuh informasi lebih lanjut? Jangan ragu untuk menghubungi tim kami
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Informasi Kontak</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 font-medium">Email</p>
                  <p className="font-medium text-gray-900">revitalisasi-sma@kemdikbud.go.id</p>
                  <p className="text-sm text-gray-500 mt-1">Respon dalam 1x24 jam</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 font-medium">Hotline</p>
                  <p className="font-medium text-gray-900">0800-1234-5678</p>
                  <p className="text-sm text-gray-500 mt-1">Gratis dari seluruh Indonesia</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 font-medium">Jam Operasional</p>
                  <p className="font-medium text-gray-900">Senin - Jumat: 08.00 - 17.00 WIB</p>
                  <p className="text-sm text-gray-500 mt-1">Tutup pada hari libur nasional</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Penting!</h4>
              <p className="text-sm text-blue-800">
                Untuk keluhan terkait progres revitalisasi sekolah, sertakan nama sekolah dan kabupaten dalam pesan Anda.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Kirim Pesan</h3>
            
            {/* Status Message */}
            {submitStatus && (
              <div className={`mb-6 p-4 rounded-lg ${
                submitStatus.type === 'success' 
                  ? 'bg-green-100 border border-green-400 text-green-700' 
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}>
                <div className="flex items-center">
                  {submitStatus.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 mr-2" />
                  )}
                  <span>{submitStatus.message}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={getInputClassName('name')}
                  placeholder="Masukkan nama lengkap Anda"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={getInputClassName('email')}
                  placeholder="nama@email.com"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className={getInputClassName('message')}
                  placeholder="Tulis pesan Anda secara detail..."
                  disabled={loading}
                ></textarea>
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Minimal 10 karakter</span>
                  <span>{formData.message.length}/2000</span>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 disabled:bg-amber-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Mengirim...
                  </>
                ) : (
                  'Kirim Pesan'
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                Dengan mengirim pesan, Anda menyetujui kebijakan privasi kami
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Kontak;