import React, { useState } from 'react';
import { MapPin, Download, Users, Calendar, FileText, CheckCircle, AlertCircle, Clock, School, Target, TrendingUp, Mail, Phone, ExternalLink, Play, ChevronDown, ChevronUp, Menu, X, Filter } from 'lucide-react';

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState('beranda');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedKabupaten, setSelectedKabupaten] = useState('semua');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // Data dummy untuk sekolah
  const schools = [
    { id: 1, name: 'SMA Negeri 1 Manado', location: 'Manado', progress: 85, fasilitator: 'Dr. Ahmad Santoso', kabupaten: 'Manado', status: 'hijau' },
    { id: 2, name: 'SMA Negeri 2 Bitung', location: 'Bitung', progress: 62, fasilitator: 'Ir. Siti Rahayu', kabupaten: 'Bitung', status: 'kuning' },
    { id: 3, name: 'SMA Negeri 1 Tomohon', location: 'Tomohon', progress: 95, fasilitator: 'M. Rizki Pratama', kabupaten: 'Tomohon', status: 'hijau' },
    { id: 4, name: 'SMA Negeri 3 Manado', location: 'Manado', progress: 45, fasilitator: 'Dra. Nina Wulandari', kabupaten: 'Manado', status: 'merah' },
    { id: 5, name: 'SMA Negeri 1 Minahasa', location: 'Tondano', progress: 78, fasilitator: 'Dr. Budi Setiawan', kabupaten: 'Minahasa', status: 'hijau' },
    { id: 6, name: 'SMA Negeri 2 Minahasa Utara', location: 'Airmadidi', progress: 55, fasilitator: 'Ir. Maya Sari', kabupaten: 'Minahasa Utara', status: 'kuning' },
  ];

  const kabupatenList = ['semua', 'Manado', 'Bitung', 'Tomohon', 'Minahasa', 'Minahasa Utara'];

  const filteredSchools = selectedKabupaten === 'semua' 
    ? schools 
    : schools.filter(school => school.kabupaten === selectedKabupaten);

  const faqData = [
    {
      question: "Bagaimana kriteria sekolah penerima program revitalisasi?",
      answer: "Sekolah dipilih berdasarkan kondisi infrastruktur yang membutuhkan perbaikan, jumlah siswa, dan lokasi strategis untuk pemerataan pendidikan."
    },
    {
      question: "Berapa lama waktu pelaksanaan program per sekolah?",
      answer: "Setiap sekolah memiliki timeline 6 bulan dari Juli hingga Desember 2025 dengan milestone yang telah ditetapkan."
    },
    {
      question: "Bagaimana cara memantau progress pembangunan?",
      answer: "Progress dapat dipantau real-time melalui dashboard website ini yang diperbarui setiap hari oleh fasilitator lapangan."
    },
    {
      question: "Siapa yang bertanggung jawab atas pelaksanaan di lapangan?",
      answer: "Setiap sekolah memiliki fasilitator khusus yang bertanggung jawab memantau dan melaporkan progress pembangunan."
    },
    {
      question: "Dokumen apa saja yang tersedia untuk publik?",
      answer: "Tersedia Juknis DAK Fisik, RPJMN 2020-2024, kontrak kerja, dan dokumen regulasi lainnya yang dapat diunduh."
    }
  ];

  const progressData = [
    { kabupaten: 'Manado', progress: 75 },
    { kabupaten: 'Bitung', progress: 62 },
    { kabupaten: 'Tomohon', progress: 95 },
    { kabupaten: 'Minahasa', progress: 68 },
    { kabupaten: 'Minahasa Utara', progress: 55 },
    { kabupaten: 'Gorontalo', progress: 80 },
  ];

  const completedProjects = [
    {
      school: 'SMA Negeri 1 Tomohon',
      completion: '100%',
      testimonial: 'Fasilitas baru sangat membantu proses pembelajaran siswa',
      headmaster: 'Drs. Robert Mandagi, M.Pd'
    },
    {
      school: 'SMA Negeri 5 Manado',
      completion: '100%',
      testimonial: 'Renovasi laboratorium memberikan dampak positif bagi siswa',
      headmaster: 'Dr. Maria Toding, S.Pd'
    },
    {
      school: 'SMA Negeri 2 Gorontalo',
      completion: '100%',
      testimonial: 'Kualitas infrastruktur sekarang jauh lebih baik',
      headmaster: 'Ir. Yusuf Latief, M.T'
    }
  ];

  const menuItems = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'program', label: 'Program' },
    { id: 'sekolah', label: 'Sekolah' },
    { id: 'progress', label: 'Progress' },
    { id: 'dokumen', label: 'Dokumen' },
    { id: 'tim', label: 'Tim' },
    { id: 'faq', label: 'FAQ' },
    { id: 'kontak', label: 'Kontak' }
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <School className="w-6 h-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Program Revitalisasi</h1>
                <p className="text-sm text-gray-600">SMA Sulut-Gorontalo 2025</p>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <nav className="hidden md:flex space-x-8">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-colors ${
                    activeSection === item.id ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t">
              <nav className="flex flex-col space-y-2">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`text-left py-2 px-4 rounded-lg transition-colors ${
                      activeSection === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="beranda" className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Portal Monitoring Revitalisasi Infrastruktur Pendidikan
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Memantau progress pembangunan dan renovasi 24 sekolah di Sulawesi Utara dan Gorontalo secara real-time
              </p>
              
              {/* Statistik Utama */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">24</div>
                  <div className="text-sm text-blue-100">Sekolah Terevitalisasi</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-300">78%</div>
                  <div className="text-sm text-blue-100">Progress Nasional</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-300">142</div>
                  <div className="text-sm text-blue-100">Dokumen Tersedia</div>
                </div>
              </div>

              <button
                onClick={() => scrollToSection('program')}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Jelajahi Program
              </button>
            </div>

            {/* Peta Interaktif */}
            <div className="bg-white rounded-xl p-6 shadow-2xl">
              <h3 className="text-gray-900 font-semibold mb-4">Peta Sebaran Sekolah</h3>
              <div className="relative h-80 bg-gray-100 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
                  {/* Simulasi pin sekolah */}
                  <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  <div className="absolute bottom-1/4 right-1/5 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  <div className="absolute top-1/5 left-1/2 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
                    <div className="text-xs text-gray-700 mb-2 font-medium">Status Progress:</div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Selesai/On Track</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Dalam Progress</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Terlambat</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tentang Program */}
      <section id="program" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Tentang Program</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Program Revitalisasi Infrastruktur Pendidikan bertujuan meningkatkan kualitas fasilitas sekolah 
              untuk mendukung proses pembelajaran yang lebih efektif dan berkualitas.
            </p>
          </div>

          {/* Video Explainer */}
          <div className="mb-16">
            <div className="bg-gray-900 rounded-xl aspect-video max-w-4xl mx-auto relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-6 hover:bg-opacity-30 transition-all">
                  <Play className="w-12 h-12 text-white ml-1" />
                </button>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <div className="text-sm font-medium">Video Explainer Program</div>
                <div className="text-xs opacity-75">Duration: 60 seconds</div>
              </div>
            </div>
          </div>

          {/* Tujuan & Manfaat */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Tujuan Program</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">Meningkatkan kualitas infrastruktur pendidikan di daerah tertinggal</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">Menciptakan lingkungan belajar yang kondusif dan modern</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">Mendukung peningkatan kualitas pendidikan nasional</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Manfaat Program</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Target className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">Siswa mendapat fasilitas belajar yang lebih baik dan modern</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Target className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">Guru dapat mengajar dengan peralatan dan ruang yang memadai</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Target className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">Masyarakat mendapat akses pendidikan berkualitas tinggi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Timeline Program</h3>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>
              <div className="space-y-8">
                {[
                  { month: 'Juli 2025', milestone: 'Kickoff & Persiapan', status: 'completed' },
                  { month: 'Agustus 2025', milestone: 'Survei & Perencanaan Detail', status: 'completed' },
                  { month: 'September 2025', milestone: 'Pelaksanaan Fase I', status: 'current' },
                  { month: 'Oktober 2025', milestone: 'Pelaksanaan Fase II', status: 'upcoming' },
                  { month: 'November 2025', milestone: 'Finishing & QC', status: 'upcoming' },
                  { month: 'Desember 2025', milestone: 'Serah Terima & Evaluasi', status: 'upcoming' }
                ].map((item, index) => (
                  <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="w-1/2 pr-8">
                      <div className={`${index % 2 === 0 ? 'text-right' : 'text-left'} ${index % 2 !== 0 ? 'pl-8' : ''}`}>
                        <div className="font-semibold text-gray-900">{item.month}</div>
                        <div className="text-gray-600">{item.milestone}</div>
                      </div>
                    </div>
                    <div className="relative flex-shrink-0">
                      <div className={`w-4 h-4 rounded-full border-4 ${
                        item.status === 'completed' ? 'bg-green-500 border-green-500' :
                        item.status === 'current' ? 'bg-blue-500 border-blue-500' :
                        'bg-gray-300 border-gray-300'
                      }`}></div>
                    </div>
                    <div className="w-1/2 pl-8"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sekolah Sasaran */}
      <section id="sekolah" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Sekolah Sasaran</h2>
            <p className="text-xl text-gray-600">
              24 sekolah telah dipilih untuk mendapatkan program revitalisasi infrastruktur
            </p>
          </div>

          {/* Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Filter by Kabupaten:</span>
              <select
                value={selectedKabupaten}
                onChange={(e) => setSelectedKabupaten(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {kabupatenList.map(kabupaten => (
                  <option key={kabupaten} value={kabupaten}>
                    {kabupaten === 'semua' ? 'Semua Kabupaten' : kabupaten}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabel Sekolah */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Sekolah</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fasilitator</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSchools.map((school) => (
                    <tr key={school.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <School className="w-5 h-5 text-gray-400 mr-3" />
                          <div className="font-medium text-gray-900">{school.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">{school.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full ${
                                school.progress >= 80 ? 'bg-green-600' : 
                                school.progress >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${school.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{school.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {school.fasilitator}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          school.status === 'hijau' ? 'bg-green-100 text-green-800' :
                          school.status === 'kuning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {school.status === 'hijau' ? 'On Track' : 
                           school.status === 'kuning' ? 'In Progress' : 'Delayed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Galeri Dokumentasi */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Galeri Dokumentasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Before - SMA Negeri 1 Tomohon', type: 'before' },
                { title: 'After - SMA Negeri 1 Tomohon', type: 'after' },
                { title: 'Progress 50% - SMA Negeri 2 Bitung', type: 'progress' },
                { title: 'Before - SMA Negeri 3 Manado', type: 'before' },
                { title: 'Progress 75% - SMA Negeri 1 Minahasa', type: 'progress' },
                { title: 'After - SMA Negeri 5 Manado', type: 'after' }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-green-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                    <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 px-3 py-1 rounded-full">
                      <span className={`text-xs font-medium ${
                        item.type === 'before' ? 'text-red-600' :
                        item.type === 'after' ? 'text-green-600' :
                        'text-yellow-600'
                      }`}>
                        {item.type === 'before' ? 'Before' : 
                         item.type === 'after' ? 'After' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Progress Real-time */}
      <section id="progress" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Progress Real-time</h2>
            <p className="text-xl text-gray-600">
              Pantau kemajuan pembangunan secara real-time dengan dashboard interaktif
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Kurva S */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Kurva S Capaian Fisik</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Kurva S Progress Chart</p>
                  <p className="text-sm text-gray-400">Data real-time dari lapangan</p>
                </div>
              </div>
            </div>

            {/* Pie Chart Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Status Proyek</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-green-200 to-blue-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-700">78%</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm">Selesai</span>
                      </div>
                      <span className="text-sm font-medium">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        <span className="text-sm">Progress</span>
                      </div>
                      <span className="text-sm font-medium">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-sm">Terlambat</span>
                      </div>
                      <span className="text-sm font-medium">4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress per Kabupaten */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-16">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Progress per Kabupaten</h3>
            <div className="space-y-4">
              {progressData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-700">{item.kabupaten}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full ${
                          item.progress >= 80 ? 'bg-green-600' : 
                          item.progress >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm font-medium text-gray-700">
                    {item.progress}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Highlight Proyek */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Proyek yang Telah Selesai</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {completedProjects.map((project, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {project.completion}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3">{project.school}</h4>
                  <blockquote className="text-gray-600 italic mb-4">
                    "{project.testimonial}"
                  </blockquote>
                  <div className="text-sm text-gray-500">
                    — {project.headmaster}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dokumen */}
      <section id="dokumen" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Dokumen & Regulasi</h2>
            <p className="text-xl text-gray-600">
              Akses dokumen legal dan regulasi terkait program revitalisasi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Juknis DAK Fisik',
                description: 'Petunjuk teknis Dana Alokasi Khusus bidang infrastruktur',
                type: 'PDF',
                size: '2.5 MB'
              },
              {
                title: 'RPJMN 2020-2024',
                description: 'Rencana Pembangunan Jangka Menengah Nasional',
                type: 'PDF',
                size: '15.8 MB'
              },
              {
                title: 'Kontrak Kerja',
                description: 'Dokumen kontrak pelaksanaan proyek',
                type: 'PDF',
                size: '1.2 MB'
              },
              {
                title: 'Standar Operasional',
                description: 'SOP pelaksanaan dan monitoring proyek',
                type: 'PDF',
                size: '3.1 MB'
              },
              {
                title: 'Laporan Kemajuan',
                description: 'Laporan bulanan progress pelaksanaan',
                type: 'PDF',
                size: '5.7 MB'
              },
              {
                title: 'Dokumentasi Teknis',
                description: 'Spesifikasi teknis dan gambar kerja',
                type: 'ZIP',
                size: '45.3 MB'
              }
            ].map((doc, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <FileText className="w-12 h-12 text-blue-500" />
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    {doc.type}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{doc.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{doc.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{doc.size}</span>
                  <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tim Pelaksana */}
      <section id="tim" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Tim Pelaksana</h2>
            <p className="text-xl text-gray-600">
              Tim profesional yang bertanggung jawab dalam pelaksanaan program
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Ketua Tim */}
            <div className="md:col-span-4 mb-8">
              <div className="bg-blue-50 rounded-xl p-8 text-center">
                <div className="w-24 h-24 bg-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Prof. Dr. Ir. Sudirman Yahya, M.Sc.</h3>
                <p className="text-blue-600 font-medium mb-2">Ketua Tim Pelaksana</p>
                <p className="text-gray-600 text-sm">
                  Koordinator utama program dengan pengalaman 25 tahun dalam pembangunan infrastruktur pendidikan
                </p>
              </div>
            </div>

            {/* Koordinator */}
            <div className="md:col-span-2">
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-green-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Dr. Sari Dewi Angraeni, M.T.</h4>
                <p className="text-green-600 font-medium text-sm mb-2">Koordinator Sulawesi Utara</p>
                <p className="text-gray-600 text-xs">
                  Mengkoordinasi 18 sekolah di wilayah Sulawesi Utara
                </p>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-green-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Ir. Muhammad Arsyad, M.Eng.</h4>
                <p className="text-green-600 font-medium text-sm mb-2">Koordinator Gorontalo</p>
                <p className="text-gray-600 text-xs">
                  Mengkoordinasi 6 sekolah di wilayah Gorontalo
                </p>
              </div>
            </div>

            {/* Partner */}
            <div className="md:col-span-4">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Target className="w-8 h-8 text-gray-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Politeknik Negeri Manado</h4>
                <p className="text-gray-600 text-sm">
                  Institusi partner yang menyediakan tenaga ahli dan dukungan teknis dalam pelaksanaan program
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Pertanyaan yang sering diajukan mengenai program revitalisasi
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {faqData.map((item, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg">
                  <button
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors"
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  >
                    <span className="font-medium text-gray-900">{item.question}</span>
                    {expandedFAQ === index ? 
                      <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    }
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Kontak */}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan nama Anda"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="nama@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pesan</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tulis pesan Anda..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Kirim Pesan
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
    </div>
  );
};

export default LandingPage;
                