import React from 'react';
import { Mail, Phone, Clock } from 'lucide-react';

const Kontak = () => {
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
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">revitalisasi-sma@kemdikbud.go.id</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-gray-600">Hotline</p>
                  <p className="font-medium text-gray-900">0800-1234-5678</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-gray-600">Jam Operasional</p>
                  <p className="font-medium text-gray-900">Senin - Jumat: 08.00 - 17.00 WIB</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Kirim Pesan</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  placeholder="Masukkan nama Anda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  placeholder="nama@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pesan</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  placeholder="Tulis pesan Anda..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                Kirim Pesan
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Kontak;