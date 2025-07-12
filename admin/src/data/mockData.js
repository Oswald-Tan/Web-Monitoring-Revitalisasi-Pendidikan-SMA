const mockData = {
  schools: [
    { id: 1, name: 'SMA Negeri 1 Manado', location: 'Manado', progress: 85, facilitator: 'Ahmad Wijaya', status: 'on-track' },
    { id: 2, name: 'SMA Negeri 2 Tomohon', location: 'Tomohon', progress: 65, facilitator: 'Siti Nurhaliza', status: 'warning' },
    { id: 3, name: 'SMA Negeri 1 Gorontalo', location: 'Gorontalo', progress: 92, facilitator: 'Budi Santoso', status: 'on-track' },
    { id: 4, name: 'SMA Negeri 3 Bitung', location: 'Bitung', progress: 45, facilitator: 'Maya Sari', status: 'delay' },
  ],
  stats: {
    totalSchools: 24,
    onTrack: 18,
    warning: 4,
    delay: 2,
    avgProgress: 78
  },
  weeklyReview: [
    { week: 'Minggu 1', planned: 15, actual: 12 },
    { week: 'Minggu 2', planned: 30, actual: 25 },
    { week: 'Minggu 3', planned: 45, actual: 40 },
    { week: 'Minggu 4', planned: 60, actual: 55 },
  ],
  topIssues: [
    { id: 1, issue: 'Keterlambatan material', count: 8 },
    { id: 2, issue: 'Cuaca buruk', count: 6 },
    { id: 3, issue: 'Keterlambatan pembayaran', count: 4 },
    { id: 4, issue: 'Perubahan desain', count: 3 },
    { id: 5, issue: 'Kendala perizinan', count: 2 },
  ],
  monthlyReport: {
    achievements: "Progress fisik secara keseluruhan mencapai 78%, melampaui target bulanan sebesar 75%. Pencapaian ini didorong oleh percepatan pekerjaan di wilayah Gorontalo yang mencapai 92%.",
    riskMatrix: [
      { risk: 'Keterlambatan material', impact: 'Tinggi', probability: 'Sedang', mitigation: 'Diversifikasi supplier' },
      { risk: 'Curah hujan tinggi', impact: 'Sedang', probability: 'Tinggi', mitigation: 'Penjadwalan ulang pekerjaan outdoor' },
    ]
  },
  templates: [
    { id: 1, name: 'Form Supervisi Harian', type: 'DOCX', size: '45 KB' },
    { id: 2, name: 'Checklist QC Bangunan', type: 'XLSX', size: '32 KB' },
    { id: 3, name: 'Bagan Alur Pelaporan', type: 'PDF', size: '120 KB' },
    { id: 4, name: 'Template Laporan Mingguan', type: 'DOCX', size: '62 KB' },
  ],
  regulations: [
    { id: 1, name: 'Perpres No. 12/2025 tentang Revitalisasi Pendidikan', category: 'Perpres', year: 2025 },
    { id: 2, name: 'Juknis DAK Fisik Bidang Pendidikan 2025', category: 'Juknis', year: 2025 },
    { id: 3, name: 'Kontrak Kerja Revitalisasi SMA Sulut-Gorontalo', category: 'Kontrak', year: 2025 },
    { id: 4, name: 'Surat Tugas Fasilitator Wilayah Sulut', category: 'Surat Tugas', year: 2025 },
  ],
  personnel: [
    { id: 1, name: 'Dr. Ahmad Santoso', role: 'Koordinator Sulut', qualifications: 'S3 Teknik Sipil, IPB', certifications: 'PMP, LEED GA', zone: 'Sulawesi Utara' },
    { id: 2, name: 'Ir. Siti Rahayu', role: 'Fasilitator', qualifications: 'S2 Manajemen Konstruksi, ITS', certifications: 'Ahli K3 Konstruksi', zone: 'Manado, Bitung' },
    { id: 3, name: 'Budi Setiawan, M.Eng', role: 'Koordinator Gorontalo', qualifications: 'S2 Teknik Arsitektur, UGM', certifications: 'Green Associate', zone: 'Gorontalo' },
  ],
  users: [
    { id: 1, name: 'admin@revitalisasi.id', role: 'Super Admin' },
    { id: 2, name: 'koordinator@revitalisasi.id', role: 'Koordinator' },
    { id: 3, name: 'fasilitator1@revitalisasi.id', role: 'Fasilitator' },
    { id: 4, name: 'sekolah1@revitalisasi.id', role: 'Admin Sekolah' },
  ],
  discussionThreads: [
    { id: 1, school: 'SMA Negeri 1 Manado', lastUpdate: '2 jam yang lalu', messages: 12, unread: 3 },
    { id: 2, school: 'SMA Negeri 2 Tomohon', lastUpdate: '5 jam yang lalu', messages: 8, unread: 0 },
    { id: 3, school: 'SMA Negeri 1 Gorontalo', lastUpdate: '1 hari yang lalu', messages: 24, unread: 5 },
  ],
  calendarEvents: [
    { id: 1, title: 'Kunjungan Lapangan SMA 1 Manado', date: '2025-09-15', time: '09:00 - 12:00' },
    { id: 2, title: 'Rapat Koordinasi Fasilitator', date: '2025-09-18', time: '14:00 - 16:00' },
    { id: 3, title: 'QC Struktur Beton SMA 3 Bitung', date: '2025-09-22', time: '10:00 - 12:00' },
  ]
};

export default mockData;