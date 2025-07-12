import React from 'react';
import { School, Target, ExternalLink, Calendar } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <School className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">Program Revitalisasi</span>
            </div>
            <p className="text-gray-400">
              Meningkatkan kualitas infrastruktur pendidikan untuk masa depan yang lebih baik.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Tautan Berguna</h4>
            <div className="space-y-2">
              <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <ExternalLink className="w-4 h-4" />
                <span>Direktorat SMA</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <ExternalLink className="w-4 h-4" />
                <span>DAK Pendidikan</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <ExternalLink className="w-4 h-4" />
                <span>SDGs Tujuan 4</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Update Terakhir</h4>
            <div className="flex items-center space-x-2 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Data diperbarui: {new Date().toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;