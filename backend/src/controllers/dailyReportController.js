import DailyReport from "../models/daily_report.js";
import RabItem from "../models/rab_item.js";
import School from "../models/school.js";
import User from "../models/user.js";

// Di controllers/dailyReportController.js
export const createDailyReport = async (req, res) => {
  try {
    const { schoolId, rabItemId, tanggal, progress, keterangan, checklist } = req.body;
    
    // Validate progress
    if (progress < 0 || progress > 100) {
      return res.status(400).json({ error: 'Progress must be between 0 and 100' });
    }
    
    // Get RAB item to calculate volume and bobot realisasi
    const rabItem = await RabItem.findByPk(rabItemId);
    if (!rabItem) {
      return res.status(404).json({ error: 'RAB item not found' });
    }
    
    // Calculate realisasi values
    const volumeRealisasi = rabItem.volume ? (progress / 100) * rabItem.volume : null;
    const bobotRealisasi = rabItem.bobot ? (progress / 100) * rabItem.bobot : null;
    
    // Handle file uploads - hanya simpan nama file
    const files = req.files || [];
    const fileNames = files.map(file => file.filename); // Hanya nama file
    
    const dailyReport = await DailyReport.create({
      schoolId,
      rabItemId,
      tanggal: new Date(tanggal),
      progress,
      volumeRealisasi,
      bobotRealisasi,
      keterangan,
      files: fileNames,
      checklist: checklist || {}
    });
    
    res.status(201).json({
      success: true,
      message: 'Laporan harian berhasil disimpan',
      data: dailyReport
    });
  } catch (error) {
    console.error('Error creating daily report:', error);
    // Hapus file yang sudah diupload jika terjadi error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../../uploads/daily-reports', file.filename);
        fs.unlink(filePath, err => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    res.status(500).json({ error: 'Failed to create daily report' });
  }
};

export const getDailyReportsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { startDate, endDate } = req.query;
    
    let whereClause = { schoolId };
    
    if (startDate && endDate) {
      whereClause.tanggal = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const dailyReports = await DailyReport.findAll({
      where: whereClause,
      include: [{
        model: RabItem,
        attributes: ['uraian', 'volume', 'satuan', 'bobot', 'building']
      }],
      order: [['tanggal', 'DESC']]
    });
    
    res.json(dailyReports);
  } catch (error) {
    console.error('Error fetching daily reports:', error);
    res.status(500).json({ error: 'Failed to fetch daily reports' });
  }
};

export const getDailyReportsForReview = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const statusReview = req.query.statusReview || "";
    const schoolId = req.query.schoolId || "";
    const offset = limit * page;

    let whereCondition = {};

    // Filter berdasarkan status review jika diberikan
    if (statusReview) {
      whereCondition.statusReview = statusReview;
    }

    // Filter berdasarkan sekolah jika diberikan
    if (schoolId) {
      whereCondition.schoolId = schoolId;
    }

    // Filter berdasarkan pencarian
    if (search) {
      whereCondition[Op.or] = [
        { keterangan: { [Op.substring]: search } },
        // Jika ingin mencari berdasarkan nama sekolah atau item pekerjaan,
        // kita perlu melakukan include dan where condition terpisah
      ];
    }

    const dailyReports = await DailyReport.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: RabItem,
          attributes: ['uraian', 'volume', 'satuan', 'bobot', 'building'],
          // Jika ingin mencari berdasarkan uraian item pekerjaan
          ...(search && {
            where: {
              uraian: { [Op.substring]: search }
            }
          })
        },
        {
          model: School,
          attributes: ['name', 'kabupaten', 'location'],
          // Jika ingin mencari berdasarkan nama sekolah
          ...(search && {
            where: {
              name: { [Op.substring]: search }
            }
          })
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['name', 'email'],
          required: false
        }
      ],
      order: [['tanggal', 'DESC']],
      distinct: true, // Penting untuk menghitung dengan benar saat ada include
      limit,
      offset
    });

    res.json({
      data: dailyReports.rows,
      page,
      limit,
      totalPages: Math.ceil(dailyReports.count / limit),
      totalRows: dailyReports.count
    });
  } catch (error) {
    console.error('Error fetching daily reports for review:', error);
    res.status(500).json({ error: 'Failed to fetch daily reports for review' });
  }
};

export const reviewDailyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusReview, catatanReview } = req.body;
    const userId = req.userId; // ID user yang melakukan review
    
    const dailyReport = await DailyReport.findByPk(id);
    if (!dailyReport) {
      return res.status(404).json({ error: 'Daily report not found' });
    }
    
    await dailyReport.update({
      statusReview,
      catatanReview,
      reviewedBy: userId,
      reviewedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Laporan harian berhasil direview',
      data: dailyReport
    });
  } catch (error) {
    console.error('Error reviewing daily report:', error);
    res.status(500).json({ error: 'Failed to review daily report' });
  }
};

export const getDailyReportDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dailyReport = await DailyReport.findByPk(id, {
      include: [
        {
          model: RabItem,
          attributes: ['uraian', 'volume', 'satuan', 'bobot', 'building']
        },
        {
          model: School,
          attributes: ['name', 'kabupaten', 'location']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['name', 'email'],
          required: false
        }
      ]
    });
    
    if (!dailyReport) {
      return res.status(404).json({ error: 'Daily report not found' });
    }
    
    res.json(dailyReport);
  } catch (error) {
    console.error('Error fetching daily report detail:', error);
    res.status(500).json({ error: 'Failed to fetch daily report detail' });
  }
};