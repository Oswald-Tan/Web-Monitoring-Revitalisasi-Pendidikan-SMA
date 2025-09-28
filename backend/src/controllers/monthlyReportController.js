import MonthlyReport from "../models/monthly_report.js";
import School from "../models/school.js";
import DailyReport from "../models/daily_report.js";
import RabItem from "../models/rab_item.js";
import WeeklyReview from "../models/weekly_review.js";
import { Op } from "sequelize";
import { generateMonthlyReportPDF } from "../utils/pdfGeneratorMonthly.js";
import User from "../models/user.js";
import TimeSchedule from "../models/time_schedule.js";
import { generateMonthlyReportsPDF } from "../utils/pdfGeneratorMonthlyReports.js";

// Generate laporan bulanan
export const generateMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.body;
    const userId = req.userId;

    // Validasi bulan dan tahun
    if (!month || !year) {
      return res.status(400).json({
        error: "Bulan dan tahun diperlukan",
      });
    }

    if (month < 1 || month > 12) {
      return res.status(400).json({
        error: "Bulan harus antara 1 dan 12",
      });
    }

    if (year < 2020 || year > 2100) {
      return res.status(400).json({
        error: "Tahun tidak valid",
      });
    }

    // Hitung tanggal awal dan akhir bulan
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Ambil semua sekolah
    const schools = await School.findAll();
    const monthlyReports = [];

    for (const school of schools) {
      // Cek apakah laporan bulanan sudah ada
      const existingReport = await MonthlyReport.findOne({
        where: {
          schoolId: school.id,
          month,
          year,
        },
      });

      // Ambil semua item RAB untuk sekolah ini
      const rabitems = await RabItem.findAll({
        where: { schoolId: school.id },
        order: [["itemNo", "ASC"]],
      });

      // Hitung progress per item RAB
      const aggregatedData = {};
      let totalBobot = 0;
      let totalProgress = 0;

      // Inisialisasi struktur data
      rabitems.forEach((item) => {
        aggregatedData[item.id] = {
          rabitem: item,
          progressAwal: 0,
          progressAkhir: 0,
          progressBulanIni: 0,
        };
        totalBobot += item.bobot || 0;
      });

      // Hitung progress awal bulan (dari hari terakhir bulan sebelumnya)
      for (const itemId in aggregatedData) {
        const progressBeforeMonth = await DailyReport.findOne({
          where: {
            schoolId: school.id,
            rabitemId: itemId,
            tanggal: {
              [Op.lt]: startDate,
            },
          },
          order: [["tanggal", "DESC"]],
        });

        if (progressBeforeMonth) {
          aggregatedData[itemId].progressAwal = progressBeforeMonth.progress;
        }
      }

      // Hitung progress akhir bulan (dari hari terakhir dalam bulan)
      for (const itemId in aggregatedData) {
        const progressEndOfMonth = await DailyReport.findOne({
          where: {
            schoolId: school.id,
            rabitemId: itemId,
            tanggal: {
              [Op.between]: [startDate, endDate],
            },
          },
          order: [["tanggal", "DESC"]],
        });

        if (progressEndOfMonth) {
          aggregatedData[itemId].progressAkhir = progressEndOfMonth.progress;
          aggregatedData[itemId].progressBulanIni =
            progressEndOfMonth.progress - aggregatedData[itemId].progressAwal;
        } else {
          aggregatedData[itemId].progressAkhir =
            aggregatedData[itemId].progressAwal;
        }
      }

      // Hitung progress keseluruhan sekolah (REA - Realisasi)
      for (const itemId in aggregatedData) {
        const itemData = aggregatedData[itemId];
        const bobotItem = itemData.rabitem.bobot || 0;
        totalProgress += (itemData.progressAkhir / 100) * bobotItem;
      }

      const overallProgress =
        totalBobot > 0 ? (totalProgress / totalBobot) * 100 : 0;

      // Hitung progress rencana (REN) berdasarkan time schedule
      const timeSchedule = await TimeSchedule.findOne({
        where: {
          schoolId: school.id,
          month: month,
          year: year,
        },
      });

      const plannedProgress = timeSchedule ? timeSchedule.plannedProgress : 0;
      const variance = parseFloat(
        (overallProgress - plannedProgress).toFixed(2)
      );

      // Tentukan status berdasarkan progress
      let status = "on-track";
      if (overallProgress >= 100) {
        status = "completed";
      } else if (variance < -10) {
        // Jika realisasi lebih dari 10% di bawah rencana
        status = "delayed";
      }

      // Ambil weekly reviews dalam rentang bulan
      const weeklyReviews = await WeeklyReview.findAll({
        where: {
          schoolId: school.id,
          [Op.or]: [
            // Minggu yang startDate-nya dalam bulan ini
            {
              startDate: {
                [Op.between]: [startDate, endDate],
              },
            },
            // Minggu yang endDate-nya dalam bulan ini
            {
              endDate: {
                [Op.between]: [startDate, endDate],
              },
            },
            // Minggu yang mencakup seluruh bulan (start sebelum, end sesudah)
            {
              [Op.and]: [
                { startDate: { [Op.lt]: startDate } },
                { endDate: { [Op.gt]: endDate } },
              ],
            },
          ],
        },
        order: [["weekNumber", "ASC"]],
      });

      // Gabungkan catatan dari weekly reviews
      let notes = "";
      let recommendations = "";

      // Urutkan weekly reviews berdasarkan minggu
      weeklyReviews.sort((a, b) => a.weekNumber - b.weekNumber);

      // Format notes dan recommendations dengan penanda minggu
      weeklyReviews.forEach((review) => {
        if (review.notes) {
          notes += `Minggu ${review.weekNumber}:\n${review.notes}\n\n`;
        }
        if (review.recommendations) {
          recommendations += `Minggu ${review.weekNumber}:\n${review.recommendations}\n\n`;
        }
      });

      // Hapus newline di akhir jika ada
      notes = notes.trim();
      recommendations = recommendations.trim();

      // Format data untuk disimpan
      const reportData = {
        school: {
          id: school.id,
          name: school.name,
          kabupaten: school.kabupaten,
          nilaiBanper: school.nilaiBanper,
          durasi: school.durasi,
          startDate: school.startDate,
          finishDate: school.finishDate,
          facilitator: school.Facilitator
            ? {
                name: school.Facilitator.name,
                phone: school.Facilitator.phone,
              }
            : null,
        },
        period: {
          month,
          year,
          startDate,
          endDate,
        },
        progress: parseFloat(overallProgress.toFixed(2)),
        plannedProgress: parseFloat(plannedProgress.toFixed(2)),
        variance: variance,
        status,
        rabItems: Object.values(aggregatedData).map((itemData) => ({
          id: itemData.rabitem.id,
          category: itemData.rabitem.category,
          uraian: itemData.rabitem.uraian,
          volume: itemData.rabitem.volume,
          satuan: itemData.rabitem.satuan,
          bobot: itemData.rabitem.bobot,
          progressAwal: itemData.progressAwal,
          progressAkhir: itemData.progressAkhir,
          progressBulanIni: itemData.progressBulanIni,
        })),
        notes,
        recommendations,
        weeklyReviews: weeklyReviews.map((review) => ({
          weekNumber: review.weekNumber,
          startDate: review.startDate,
          endDate: review.endDate,
          notes: review.notes,
          recommendations: review.recommendations,
        })),
      };

      let monthlyReport;

      if (existingReport) {
        // Update laporan yang sudah ada
        monthlyReport = await existingReport.update({
          progress: overallProgress,
          plannedProgress: plannedProgress,
          variance: variance,
          status,
          notes,
          recommendations,
          data: reportData,
          generatedBy: userId,
        });
      } else {
        // Buat laporan baru
        monthlyReport = await MonthlyReport.create({
          schoolId: school.id,
          month,
          year,
          progress: overallProgress,
          plannedProgress: plannedProgress,
          variance: variance,
          status,
          notes,
          recommendations,
          data: reportData,
          generatedBy: userId,
        });
      }

      monthlyReports.push(monthlyReport);
    }

    res.status(201).json({
      success: true,
      message: `Laporan bulanan ${month}/${year} berhasil digenerate`,
      data: monthlyReports,
    });
  } catch (error) {
    console.error("Error generating monthly report:", error);
    res.status(500).json({
      success: false,
      error: "Gagal generate laporan bulanan",
      details: error.message,
    });
  }
};

// Get semua laporan bulanan
export const getMonthlyReports = async (req, res) => {
  try {
    const { month, year, page = 1, limit = 10 } = req.query;
    let whereClause = {};

    if (month && year) {
      whereClause.month = parseInt(month);
      whereClause.year = parseInt(year);
    }

    const offset = (page - 1) * limit;

    // Pastikan hanya mengambil satu laporan per sekolah untuk periode tertentu
    const { count, rows } = await MonthlyReport.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: School,
          attributes: [
            "id",
            "name",
            "kabupaten",
            "nilaiBanper",
            "durasi",
            "startDate",
            "finishDate",
          ],
        },
        {
          model: User,
          as: "generator",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [
        [School, "name", "ASC"],
        ["year", "DESC"],
        ["month", "DESC"],
      ],
      limit: parseInt(limit),
      offset: offset,
      // Group by schoolId untuk memastikan tidak ada duplikat
      distinct: true,
      col: 'schoolId'
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
    console.error("Error getting monthly reports:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data laporan bulanan",
    });
  }
};
// Get laporan bulanan by ID
export const getMonthlyReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const monthlyReport = await MonthlyReport.findByPk(id, {
      include: [
        {
          model: School,
          attributes: [
            "id",
            "name",
            "kabupaten",
            "nilaiBanper",
            "durasi",
            "startDate",
            "finishDate",
          ],
        },
        {
          model: User,
          as: "generator",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!monthlyReport) {
      return res.status(404).json({
        success: false,
        error: "Laporan bulanan tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: monthlyReport,
    });
  } catch (error) {
    console.error("Error getting monthly report:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data laporan bulanan",
    });
  }
};

// Generate PDF laporan bulanan
export const downloadMonthlyReportPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const monthlyReport = await MonthlyReport.findByPk(id, {
      include: [
        {
          model: School,
          attributes: [
            "id",
            "name",
            "kabupaten",
            "nilaiBanper",
            "durasi",
            "startDate",
            "finishDate",
          ],
        },
        {
          model: User,
          as: "generator", // Make sure this matches your association alias
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!monthlyReport) {
      return res.status(404).json({
        success: false,
        error: "Laporan bulanan tidak ditemukan",
      });
    }

    // Generate PDF
    const pdfBuffer = await generateMonthlyReportPDF(monthlyReport);

    // Set headers untuk download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=laporan-bulanan-${monthlyReport.School.name}-${monthlyReport.month}-${monthlyReport.year}.pdf`
    );

    // Kirim PDF sebagai response
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      success: false,
      error: "Gagal generate PDF laporan bulanan",
    });
  }
};

// Export semua laporan bulanan dalam satu PDF
export const exportMonthlyReportsPDF = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        error: "Bulan dan tahun diperlukan",
      });
    }

    // Convert to numbers
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Cari laporan berdasarkan bulan dan tahun
    const reports = await MonthlyReport.findAll({
      where: {
        [Op.or]: [
          // Format integer
          { month: monthNum, year: yearNum },
          // Format string
          { month: month.toString(), year: year.toString() },
          // Format dengan leading zero
          { month: month.toString().padStart(2, "0"), year: year.toString() },
          // Format khusus untuk data yang mungkin tidak konsisten
          { month: monthNum, year: yearNum + "" },
          { month: monthNum + "", year: yearNum },
        ],
      },
      include: [
        {
          model: School,
          attributes: [
            "id",
            "name",
            "kabupaten",
            "nilaiBanper",
            "durasi",
            "startDate",
            "finishDate",
          ],
        },
      ],
      order: [[School, "name", "ASC"]],
    });

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Tidak ada data laporan untuk periode tersebut",
      });
    }

    // Generate PDF
    const pdfBuffer = await generateMonthlyReportsPDF(reports, month, year);

    // Set headers untuk download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=laporan-bulanan-${month}-${year}.pdf`
    );

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error exporting monthly reports PDF:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengekspor PDF laporan bulanan",
    });
  }
};

// Update notes dan recommendations secara manual
export const updateMonthlyReportNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, recommendations } = req.body;

    const monthlyReport = await MonthlyReport.findByPk(id);
    if (!monthlyReport) {
      return res.status(404).json({
        success: false,
        error: "Laporan bulanan tidak ditemukan",
      });
    }

    // Update notes dan recommendations
    await monthlyReport.update({
      notes,
      recommendations,
      data: {
        ...monthlyReport.data,
        notes,
        recommendations,
      },
    });

    res.json({
      success: true,
      message: "Catatan laporan bulanan berhasil diperbarui",
      data: monthlyReport,
    });
  } catch (error) {
    console.error("Error updating monthly report notes:", error);
    res.status(500).json({
      success: false,
      error: "Gagal memperbarui catatan laporan bulanan",
    });
  }
};
