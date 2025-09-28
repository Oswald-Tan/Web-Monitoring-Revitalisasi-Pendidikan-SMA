import WeeklyReview from "../models/weekly_review.js";
import DailyReport from "../models/daily_report.js";
import RabItem from "../models/rab_item.js";
import School from "../models/school.js";
import { Op } from "sequelize";
import { generateWeeklyReportPDF } from "../utils/pdfGenerator.js";
import User from "../models/user.js";

export const getWeeklyAggregate = async (req, res) => {
  try {
    const { schoolId, startDate, endDate, weekNumber, year } = req.query;

    if (!schoolId || !startDate || !endDate) {
      return res.status(400).json({
        error: "schoolId, startDate, dan endDate diperlukan",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: "Format tanggal tidak valid",
      });
    }

    const school = await School.findByPk(schoolId);
    if (!school) {
      return res.status(404).json({ error: "Sekolah tidak ditemukan" });
    }

    const rabItems = await RabItem.findAll({
      where: { schoolId },
      order: [["itemNo", "ASC"]],
    });

    const categories = {};
    const totals = {
      volume: 0,
      bobot: 0,
      sdMingguLaluVolume: 0,
      sdMingguLaluBobot: 0,
      dalamMingguIniVolume: 0,
      dalamMingguIniBobot: 0,
      sdMingguIniVolume: 0,
      sdMingguIniBobot: 0,
      bobotMasing: 0,
    };

    let totalWeightedProgress = 0;
    let totalBobot = 0;

    for (const item of rabItems) {
      const progressBeforeRange = await DailyReport.findOne({
        where: {
          schoolId,
          rabItemId: item.id,
          tanggal: {
            [Op.lt]: start,
          },
        },
        order: [['tanggal', 'DESC']],
      });

      const progressInRange = await DailyReport.findOne({
        where: {
          schoolId,
          rabItemId: item.id,
          tanggal: {
            [Op.lte]: end,
          },
        },
        order: [['tanggal', 'DESC']],
      });

      const progressSdMingguLalu = progressBeforeRange ? progressBeforeRange.progress : 0;
      const progressSdMingguIni = progressInRange ? progressInRange.progress : 0;
      const progressDalamMingguIni = Math.max(0, progressSdMingguIni - progressSdMingguLalu);

      const sdMingguLaluVolume = (progressSdMingguLalu / 100) * (item.volume || 0);
      const sdMingguLaluBobot = (progressSdMingguLalu / 100) * (item.bobot || 0);
      const dalamMingguIniVolume = (progressDalamMingguIni / 100) * (item.volume || 0);
      const dalamMingguIniBobot = (progressDalamMingguIni / 100) * (item.bobot || 0);
      const sdMingguIniVolume = (progressSdMingguIni / 100) * (item.volume || 0);
      const sdMingguIniBobot = (progressSdMingguIni / 100) * (item.bobot || 0);

      totalWeightedProgress += (progressSdMingguIni / 100) * (item.bobot || 0);
      totalBobot += (item.bobot || 0);

      if (!categories[item.category]) {
        categories[item.category] = {
          category: item.category,
          title: item.category,
          items: [],
        };
      }

      categories[item.category].items.push({
        id: item.id,
        no: item.itemNo,
        uraian: item.uraian,
        volume: item.volume || 0,
        sat: item.satuan || '',
        bobot: item.bobot || 0,
        sdMingguLaluVolume,
        sdMingguLaluBobot,
        dalamMingguIniVolume,
        dalamMingguIniBobot,
        sdMingguIniVolume,
        sdMingguIniBobot,
        bobotMasing: progressSdMingguIni,
        keterangan: "",
      });

      totals.volume += item.volume || 0;
      totals.bobot += item.bobot || 0;
      totals.sdMingguLaluVolume += sdMingguLaluVolume;
      totals.sdMingguLaluBobot += sdMingguLaluBobot;
      totals.dalamMingguIniVolume += dalamMingguIniVolume;
      totals.dalamMingguIniBobot += dalamMingguIniBobot;
      totals.sdMingguIniVolume += sdMingguIniVolume;
      totals.sdMingguIniBobot += sdMingguIniBobot;
      totals.bobotMasing += progressSdMingguIni;
    }

    const overallProgress = totalBobot > 0 ? (totalWeightedProgress / totalBobot) * 100 : 0;

    // Cek apakah sudah ada review untuk periode ini
    const existingReview = await WeeklyReview.findOne({
      where: {
        schoolId,
        weekNumber: weekNumber || Math.ceil(new Date(startDate).getDate() / 7),
        year: year || new Date().getFullYear(),
      },
      include: [
        { model: User, as: 'reviewer', attributes: ['id', 'name'] }
      ]
    });

    res.json({
      success: true,
      data: {
        headerInfo: {
          sekolah: school.name,
          kabupaten: school.kabupaten,
          weekNumber: weekNumber || Math.ceil(new Date(startDate).getDate() / 7),
          year: year || new Date().getFullYear(),
          startDate,
          endDate,
          totalBobot,
          overallProgress: parseFloat(overallProgress.toFixed(2)),
        },
        tableData: Object.values(categories),
        totals,
        hasData: rabItems.length > 0,
        existingReview: existingReview || null
      },
    });
  } catch (error) {
    console.error("Error getting weekly aggregate:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data agregat mingguan",
    });
  }
};

// Di backend controller, pastikan createWeeklyReview menerima data dengan benar
export const createWeeklyReview = async (req, res) => {
  try {
    const {
      schoolId,
      weekNumber,
      year,
      startDate,
      endDate,
      notes,
      recommendations,
      technicalIssues,
      data,
      status
    } = req.body;

    if (!schoolId || !weekNumber || !year || !startDate || !endDate) {
      return res.status(400).json({
        error: "Data yang diperlukan tidak lengkap",
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        error: "User tidak terautentikasi",
      });
    }

    const existingReview = await WeeklyReview.findOne({
      where: {
        schoolId,
        weekNumber,
        year,
      },
    });

    let weeklyReview;
    if (existingReview && !req.params.id) {
      return res.status(400).json({
        error: "Review untuk minggu ini sudah ada",
      });
    }

    if (req.params.id) {
      weeklyReview = await WeeklyReview.findByPk(req.params.id);
      if (!weeklyReview) {
        return res.status(404).json({ error: "Review tidak ditemukan" });
      }
      
      // Koordinator dapat mengupdate status, catatan, rekomendasi, dan masalah teknis
      await weeklyReview.update({
        notes: notes || weeklyReview.notes,
        recommendations: recommendations || weeklyReview.recommendations,
        technicalIssues: technicalIssues || weeklyReview.technicalIssues,
        data: data || weeklyReview.data,
        status: status || weeklyReview.status,
        reviewedBy: req.userId
      });
    } else {
      weeklyReview = await WeeklyReview.create({
        schoolId,
        weekNumber,
        year,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reviewedBy: req.userId,
        notes,
        recommendations,
        technicalIssues,
        data,
        status: status || "draft",
      });
    }

    res.status(201).json({
      success: true,
      message: "Review mingguan berhasil disimpan",
      data: weeklyReview,
    });
  } catch (error) {
    console.error("Error creating weekly review:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menyimpan review mingguan",
    });
  }
};

export const getWeeklyReviews = async (req, res) => {
  try {
    const { schoolId, year, page = 1, limit = 10 } = req.query;

    let whereClause = {};
    if (schoolId) whereClause.schoolId = schoolId;
    if (year) whereClause.year = year;

    const offset = (page - 1) * limit;

    const { count, rows } = await WeeklyReview.findAndCountAll({
      where: whereClause,
      include: [
        { model: School, attributes: ["id", "name", "kabupaten"] },
        { model: User, as: "reviewer", attributes: ["id", "name", "email"] },
      ],
      order: [
        ["year", "DESC"],
        ["weekNumber", "DESC"],
      ],
      limit: parseInt(limit),
      offset: offset,
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error getting weekly reviews:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data review mingguan",
    });
  }
};


export const exportWeeklyReviewPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const weeklyReview = await WeeklyReview.findByPk(id, {
      include: [
        {
          model: School,
          attributes: ["id", "name", "kabupaten"],
        },
        { model: User, as: "reviewer", attributes: ["id", "name"] },
      ],
    });

    if (!weeklyReview) {
      return res.status(404).json({ error: "Review mingguan tidak ditemukan" });
    }

    // Generate PDF
    const pdfBuffer = await generateWeeklyReportPDF(weeklyReview);

    // Set headers untuk download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="laporan-mingguan-${weeklyReview.school.name}-minggu-${weeklyReview.weekNumber}-${weeklyReview.year}.pdf"`
    );

    // Kirim PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error exporting weekly review PDF:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengekspor PDF",
    });
  }
};

export const updateWeeklyReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["draft", "submitted", "approved"].includes(status)) {
      return res.status(400).json({ error: "Status tidak valid" });
    }

    const weeklyReview = await WeeklyReview.findByPk(id);
    if (!weeklyReview) {
      return res.status(404).json({ error: "Review mingguan tidak ditemukan" });
    }

    weeklyReview.status = status;
    await weeklyReview.save();

    res.json({
      success: true,
      message: "Status review berhasil diperbarui",
      data: weeklyReview,
    });
  } catch (error) {
    console.error("Error updating weekly review status:", error);
    res.status(500).json({
      success: false,
      error: "Gagal memperbarui status review",
    });
  }
};

export const exportWeeklyAggregatePDF = async (req, res) => {
  try {
    const { schoolId, weekNumber, year, startDate, endDate } = req.query;

    if (!schoolId || !startDate || !endDate) {
      return res.status(400).json({
        error: "schoolId, startDate, dan endDate diperlukan",
      });
    }

    // Konversi tanggal dan atur waktu dengan benar
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Validasi tambahan untuk memastikan tanggal sesuai
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: "Format tanggal tidak valid",
      });
    }

    // Ambil data sekolah
    const school = await School.findByPk(schoolId);
    if (!school) {
      return res.status(404).json({ error: "Sekolah tidak ditemukan" });
    }

    // Ambil semua item RAB untuk sekolah ini
    const rabItems = await RabItem.findAll({
      where: { schoolId },
      order: [["itemNo", "ASC"]],
    });

    // Format data untuk response
    const categories = {};
    const totals = {
      volume: 0,
      bobot: 0,
      sdMingguLaluVolume: 0,
      sdMingguLaluBobot: 0,
      dalamMingguIniVolume: 0,
      dalamMingguIniBobot: 0,
      sdMingguIniVolume: 0,
      sdMingguIniBobot: 0,
      bobotMasing: 0,
    };

    let totalWeightedProgress = 0;
    let totalBobot = 0;

    // Hitung progress untuk setiap item
    for (const item of rabItems) {
      // Progress s/d minggu lalu (sebelum rentang tanggal)
      const progressBeforeRange = await DailyReport.findOne({
        where: {
          schoolId,
          rabItemId: item.id,
          tanggal: {
            [Op.lt]: start,
          },
        },
        order: [['tanggal', 'DESC']],
      });

      // Progress s/d minggu ini (termasuk rentang tanggal)
      const progressInRange = await DailyReport.findOne({
        where: {
          schoolId,
          rabItemId: item.id,
          tanggal: {
            [Op.lte]: end,
          },
        },
        order: [['tanggal', 'DESC']],
      });

      const progressSdMingguLalu = progressBeforeRange ? progressBeforeRange.progress : 0;
      const progressSdMingguIni = progressInRange ? progressInRange.progress : 0;
      const progressDalamMingguIni = Math.max(0, progressSdMingguIni - progressSdMingguLalu);

      // Hitung nilai realisasi
      const sdMingguLaluVolume = (progressSdMingguLalu / 100) * (item.volume || 0);
      const sdMingguLaluBobot = (progressSdMingguLalu / 100) * (item.bobot || 0);
      const dalamMingguIniVolume = (progressDalamMingguIni / 100) * (item.volume || 0);
      const dalamMingguIniBobot = (progressDalamMingguIni / 100) * (item.bobot || 0);
      const sdMingguIniVolume = (progressSdMingguIni / 100) * (item.volume || 0);
      const sdMingguIniBobot = (progressSdMingguIni / 100) * (item.bobot || 0);

      // Hitung total progress untuk overall
      totalWeightedProgress += (progressSdMingguIni / 100) * (item.bobot || 0);
      totalBobot += (item.bobot || 0);

      // Kelompokkan berdasarkan kategori
      if (!categories[item.category]) {
        categories[item.category] = {
          category: item.category,
          title: item.category,
          items: [],
        };
      }

      categories[item.category].items.push({
        id: item.id,
        no: item.itemNo,
        uraian: item.uraian,
        volume: item.volume || 0,
        sat: item.satuan || '',
        bobot: item.bobot || 0,
        sdMingguLaluVolume,
        sdMingguLaluBobot,
        dalamMingguIniVolume,
        dalamMingguIniBobot,
        sdMingguIniVolume,
        sdMingguIniBobot,
        bobotMasing: progressSdMingguIni,
        keterangan: "",
      });

      // Akumulasi total
      totals.volume += item.volume || 0;
      totals.bobot += item.bobot || 0;
      totals.sdMingguLaluVolume += sdMingguLaluVolume;
      totals.sdMingguLaluBobot += sdMingguLaluBobot;
      totals.dalamMingguIniVolume += dalamMingguIniVolume;
      totals.dalamMingguIniBobot += dalamMingguIniBobot;
      totals.sdMingguIniVolume += sdMingguIniVolume;
      totals.sdMingguIniBobot += sdMingguIniBobot;
      totals.bobotMasing += progressSdMingguIni;
    }

    // Hitung progress keseluruhan
    const overallProgress = totalBobot > 0 ? (totalWeightedProgress / totalBobot) * 100 : 0;

    const data = {
      headerInfo: {
        sekolah: school.name,
        kabupaten: school.kabupaten,
        weekNumber: weekNumber || Math.ceil(new Date(startDate).getDate() / 7),
        year: year || new Date().getFullYear(),
        startDate,
        endDate,
        totalBobot,
        overallProgress: parseFloat(overallProgress.toFixed(2)),
      },
      tableData: Object.values(categories),
      totals,
      hasData: rabItems.length > 0,
    };

    // Buat objek mirip weeklyReview untuk generate PDF
    const pdfData = {
      school: {
        name: school.name,
        kabupaten: school.kabupaten,
      },
      weekNumber: parseInt(weekNumber),
      year: parseInt(year),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      data: data,
      reviewer: {
        name: req.user ? req.user.name : "Unknown",
      },
    };

    // Generate PDF
    const pdfBuffer = await generateWeeklyReportPDF(pdfData);

    // Set headers untuk download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="laporan-mingguan-${schoolId}-minggu-${weekNumber}-${year}.pdf"`
    );

    // Kirim PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error exporting weekly aggregate PDF:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengekspor PDF",
    });
  }
};

export const getCommonTechnicalIssues = async (req, res) => {
  try {
    // Daftar masalah teknis umum yang telah dikategorikan
    const commonIssues = {
      struktural: [
        "Pondasi tidak sesuai spesifikasi",
        "Struktur beton tidak memenuhi standar",
        "Keretakan pada struktur bangunan"
      ],
      material: [
        "Material tidak sesuai spesifikasi",
        "Kualitas material di bawah standar",
        "Keterlambatan pengiriman material"
      ],
      peralatan: [
        "Peralatan tidak memadai",
        "Peralatan rusak",
        "Kurangnya peralatan pendukung"
      ],
      tenaga_kerja: [
        "Keterbatasan tenaga terampil",
        "Produktivitas tenaga kerja rendah",
        "Absensi tenaga kerja tidak teratur"
      ],
      lingkungan: [
        "Cuaca buruk menghambat pekerjaan",
        "Kondisi tanah tidak sesuai ekspektasi",
        "Kendala akses ke lokasi"
      ],
      administrasi: [
        "Dokumen tidak lengkap",
        "Proses administrasi lambat",
        "Koordinasi dengan pihak terkait kurang"
      ]
    };

    res.json({
      success: true,
      data: commonIssues
    });
  } catch (error) {
    console.error("Error getting common technical issues:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data masalah teknis umum",
    });
  }
};