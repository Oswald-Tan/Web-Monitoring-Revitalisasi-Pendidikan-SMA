import School from '../models/school.js';
import DailyReport from '../models/daily_report.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Get all schools with their status
    const schools = await School.findAll({
      attributes: ['id', 'name', 'kabupaten', 'progress', 'status']
    });

    // Calculate statistics
    const totalSchools = schools.length;
    const onTrackSchools = schools.filter(school => school.status === 'on-track').length;
    const delayedSchools = schools.filter(school => school.status === 'delayed').length;
    const completedSchools = schools.filter(school => school.status === 'completed').length;

    // Get progress by kabupaten
    const kabupatenData = schools.reduce((acc, school) => {
      const { kabupaten, progress, status } = school;
      
      if (!acc[kabupaten]) {
        acc[kabupaten] = {
          kabupaten,
          totalSekolah: 0,
          totalProgress: 0,
          sekolah: [],
          statusCount: {
            'on-track': 0,
            'delayed': 0,
            'completed': 0
          }
        };
      }
      
      acc[kabupaten].totalSekolah += 1;
      acc[kabupaten].totalProgress += progress;
      acc[kabupaten].sekolah.push({
        id: school.id,
        name: school.name,
        progress,
        status
      });
      
      // Count status
      acc[kabupaten].statusCount[status] += 1;
      
      return acc;
    }, {});

    // Calculate average progress per kabupaten
    const progressByKabupaten = Object.values(kabupatenData).map(item => ({
      ...item,
      averageProgress: Math.round(item.totalProgress / item.totalSekolah)
    }));

    res.json({
      success: true,
      data: {
        stats: {
          totalSchools,
          onTrackSchools,
          completedSchools,
          delayedSchools
        },
        progressByKabupaten,
        topSchools: schools
          .sort((a, b) => b.progress - a.progress)
          .slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
};

export const getMySchoolProgress = async (req, res) => {
  try {
    // Hanya untuk role admin_sekolah
    if (req.role !== 'admin_sekolah') {
      return res.status(403).json({
        success: false,
        error: 'Akses ditolak. Hanya admin sekolah yang dapat mengakses data ini.'
      });
    }

    // Cari sekolah berdasarkan admin_id
    const school = await School.findOne({
      where: { admin_id: req.userId },
      attributes: ['id', 'name', 'progress', 'status', 'startDate', 'finishDate']
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        error: 'Sekolah tidak ditemukan untuk admin ini'
      });
    }

    // Ambil data progress bulanan dari daily reports
    const monthlyProgress = await getMonthlyProgressData(school.id);

    res.json({
      success: true,
      data: {
        school: {
          id: school.id,
          name: school.name,
          currentProgress: school.progress,
          status: school.status,
          timeline: {
            start: school.startDate,
            finish: school.finishDate
          }
        },
        chartData: monthlyProgress
      }
    });
  } catch (error) {
    console.error('Error fetching school progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch school progress data'
    });
  }
};

// Fungsi untuk mendapatkan data progress bulanan
const getMonthlyProgressData = async (schoolId) => {
  try {
    // Ambil semua laporan harian untuk sekolah ini
    const dailyReports = await DailyReport.findAll({
      where: { schoolId },
      attributes: ['tanggal', 'progress'],
      order: [['tanggal', 'ASC']]
    });

    // Kelompokkan data per bulan
    const monthlyData = {};
    
    dailyReports.forEach(report => {
      const date = new Date(report.tanggal);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthName,
          totalProgress: 0,
          count: 0
        };
      }
      
      monthlyData[monthYear].totalProgress += report.progress;
      monthlyData[monthYear].count += 1;
    });

    // Hitung rata-rata progress per bulan
    const result = Object.values(monthlyData).map(item => ({
      month: item.month,
      progress: Math.round(item.totalProgress / item.count)
    }));

    return result;
  } catch (error) {
    console.error('Error getting monthly progress data:', error);
    return [];
  }
};