import FinalReport from "../models/final_report.js";
import School from "../models/school.js";
import DailyReport from "../models/daily_report.js";
import WeeklyReview from "../models/weekly_review.js";
import MonthlyReport from "../models/monthly_report.js";
import RabItem from "../models/rab_item.js";
import User from "../models/user.js";
import { Op } from "sequelize";
import { generateFinalReportPDF } from "../utils/pdfGeneratorFinal.js";
import { generateFinalReportsPDF } from "../utils/pdfGeneratorFinalReports.js";

// Generate laporan akhir untuk sekolah
export const generateFinalReport = async (req, res) => {
  try {
    const { schoolId, periodStart, periodEnd, executiveSummary } = req.body;
    const userId = req.userId;

    if (!schoolId || !periodStart || !periodEnd) {
      return res.status(400).json({
        error: "Sekolah, periode mulai, dan periode akhir diperlukan",
      });
    }

    // Validasi tanggal
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        error: "Format tanggal tidak valid",
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        error: "Tanggal mulai harus sebelum tanggal akhir",
      });
    }

    // Get school data
    const school = await School.findByPk(schoolId, {
      include: [
        {
          model: User,
          as: 'Facilitator',
          attributes: ['id', 'name', 'email', 'phone_number']
        }
      ]
    });

    if (!school) {
      return res.status(404).json({
        error: "Sekolah tidak ditemukan",
      });
    }

    // Get all RAB items for the school
    const rabItems = await RabItem.findAll({
      where: { schoolId },
      order: [["category", "ASC"], ["itemNo", "ASC"]],
    });

    // Get all daily reports within period
    const dailyReports = await DailyReport.findAll({
      where: {
        schoolId,
        tanggal: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: RabItem,
          attributes: ["id", "uraian", "category", "volume", "satuan", "bobot"],
        },
      ],
      order: [["tanggal", "ASC"]],
    });

    // Get all weekly reviews within period
    const weeklyReviews = await WeeklyReview.findAll({
      where: {
        schoolId,
        [Op.or]: [
          {
            startDate: {
              [Op.between]: [startDate, endDate],
            },
          },
          {
            endDate: {
              [Op.between]: [startDate, endDate],
            },
          },
        ],
      },
      order: [
        ["year", "ASC"],
        ["weekNumber", "ASC"],
      ],
    });

    // Get all monthly reports within period
    const monthlyReports = await MonthlyReport.findAll({
      where: {
        schoolId,
        [Op.or]: [
          {
            createdAt: {
              [Op.between]: [startDate, endDate],
            },
          },
          {
            data: {
              period: {
                startDate: { [Op.between]: [startDate, endDate] },
                endDate: { [Op.between]: [startDate, endDate] },
              },
            },
          },
        ],
      },
      order: [
        ["year", "ASC"],
        ["month", "ASC"],
      ],
    });

    // Calculate financial summary
    const totalBudget = rabItems.reduce((sum, item) => sum + (item.nilai || 0), 0);
    const realizedBudget = dailyReports.reduce((sum, report) => {
      const item = rabItems.find(i => i.id === report.rabItemId);
      if (item && item.nilai) {
        return sum + (report.progress / 100) * (item.nilai || 0);
      }
      return sum;
    }, 0);

    // Calculate physical progress
    const totalBobot = rabItems.reduce((sum, item) => sum + (item.bobot || 0), 0);
    let totalWeightedProgress = 0;

    for (const item of rabItems) {
      const latestReport = await DailyReport.findOne({
        where: {
          schoolId,
          rabItemId: item.id,
          tanggal: {
            [Op.lte]: endDate,
          },
        },
        order: [["tanggal", "DESC"]],
      });

      const itemProgress = latestReport ? latestReport.progress : 0;
      totalWeightedProgress += (itemProgress / 100) * (item.bobot || 0);
    }

    const overallProgress = totalBobot > 0 ? (totalWeightedProgress / totalBobot) * 100 : 0;

    // Identify challenges from weekly reviews
    const challenges = [];
    weeklyReviews.forEach(review => {
      if (review.notes && review.notes.toLowerCase().includes('masalah')) {
        challenges.push({
          week: review.weekNumber,
          date: review.startDate,
          description: review.notes
        });
      }
    });

    // Identify achievements
    const achievements = [];
    const milestoneReports = dailyReports.filter(report => 
      report.progress === 100 || 
      report.progress === 50 || 
      report.progress === 30
    );
    
    milestoneReports.forEach(report => {
      achievements.push({
        date: report.tanggal,
        item: report.RabItem?.uraian,
        progress: report.progress
      });
    });

    // Prepare report data
    const reportData = {
      school: {
        id: school.id,
        name: school.name,
        kabupaten: school.kabupaten,
        location: school.location,
        nilaiBanper: school.nilaiBanper,
        durasi: school.durasi,
        startDate: school.startDate,
        finishDate: school.finishDate,
        facilitator: school.Facilitator,
      },
      period: {
        start: startDate,
        end: endDate,
      },
      executiveSummary: executiveSummary || `Laporan akhir revitalisasi ${school.name} periode ${startDate.toLocaleDateString('id-ID')} hingga ${endDate.toLocaleDateString('id-ID')}`,
      financialSummary: {
        totalBudget,
        realizedBudget,
        utilizationPercentage: totalBudget > 0 ? (realizedBudget / totalBudget) * 100 : 0,
        details: rabItems.map(item => ({
          category: item.category,
          uraian: item.uraian,
          budget: item.nilai || 0,
          realized: dailyReports
            .filter(r => r.rabItemId === item.id)
            .reduce((sum, r) => sum + (r.progress / 100) * (item.nilai || 0), 0)
        }))
      },
      physicalProgress: {
        overall: overallProgress,
        byCategory: {},
        details: rabItems.map(item => {
          const latestReport = dailyReports
            .filter(r => r.rabItemId === item.id)
            .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))[0];
          
          return {
            category: item.category,
            uraian: item.uraian,
            volume: item.volume,
            satuan: item.satuan,
            bobot: item.bobot,
            progress: latestReport ? latestReport.progress : 0
          };
        })
      },
      challenges,
      achievements,
      recommendations: [],
      documents: {
        dailyReports: dailyReports.length,
        weeklyReviews: weeklyReviews.length,
        monthlyReports: monthlyReports.length
      }
    };

    // Group progress by category
    reportData.physicalProgress.details.forEach(item => {
      if (!reportData.physicalProgress.byCategory[item.category]) {
        reportData.physicalProgress.byCategory[item.category] = {
          totalBobot: 0,
          totalProgress: 0
        };
      }
      reportData.physicalProgress.byCategory[item.category].totalBobot += item.bobot || 0;
      reportData.physicalProgress.byCategory[item.category].totalProgress += 
        (item.progress / 100) * (item.bobot || 0);
    });

    // Calculate progress percentage by category
    Object.keys(reportData.physicalProgress.byCategory).forEach(category => {
      const catData = reportData.physicalProgress.byCategory[category];
      catData.percentage = catData.totalBobot > 0 ? 
        (catData.totalProgress / catData.totalBobot) * 100 : 0;
    });

    // Check if final report already exists
    const existingReport = await FinalReport.findOne({
      where: {
        schoolId,
        periodStart: startDate,
        periodEnd: endDate
      }
    });

    let finalReport;
    if (existingReport) {
      // Update existing report
      finalReport = await existingReport.update({
        executiveSummary,
        data: reportData,
        generatedBy: userId
      });
    } else {
      // Create new report
      finalReport = await FinalReport.create({
        schoolId,
        periodStart: startDate,
        periodEnd: endDate,
        executiveSummary,
        data: reportData,
        generatedBy: userId,
        status: 'draft'
      });
    }

    res.status(201).json({
      success: true,
      message: `Laporan akhir berhasil digenerate untuk ${school.name}`,
      data: finalReport
    });

  } catch (error) {
    console.error("Error generating final report:", error);
    res.status(500).json({
      success: false,
      error: "Gagal generate laporan akhir",
      details: error.message,
    });
  }
};

// Get all final reports
export const getFinalReports = async (req, res) => {
  try {
    const { schoolId, page = 1, limit = 10, status } = req.query;
    
    let whereClause = {};
    if (schoolId) whereClause.schoolId = schoolId;
    if (status) whereClause.status = status;

    const offset = (page - 1) * limit;

    const { count, rows } = await FinalReport.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: School,
          attributes: ['id', 'name', 'kabupaten', 'location']
        },
        {
          model: User,
          as: 'generator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [
        ['createdAt', 'DESC']
      ],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error("Error getting final reports:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data laporan akhir"
    });
  }
};

// Get final report by ID
export const getFinalReportById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const finalReport = await FinalReport.findByPk(id, {
      include: [
        {
          model: School,
          attributes: ['id', 'name', 'kabupaten', 'location', 'nilaiBanper', 'durasi', 'startDate', 'finishDate']
        },
        {
          model: User,
          as: 'generator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!finalReport) {
      return res.status(404).json({
        success: false,
        error: "Laporan akhir tidak ditemukan"
      });
    }

    res.json({
      success: true,
      data: finalReport
    });
  } catch (error) {
    console.error("Error getting final report:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data laporan akhir"
    });
  }
};

// Update final report
export const updateFinalReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { executiveSummary, achievements, challenges, recommendations, status } = req.body;

    const finalReport = await FinalReport.findByPk(id);
    if (!finalReport) {
      return res.status(404).json({
        success: false,
        error: "Laporan akhir tidak ditemukan"
      });
    }

    // Update fields
    const updates = {};
    if (executiveSummary !== undefined) updates.executiveSummary = executiveSummary;
    if (achievements !== undefined) updates.achievements = achievements;
    if (challenges !== undefined) updates.challenges = challenges;
    if (recommendations !== undefined) updates.recommendations = recommendations;
    if (status !== undefined) updates.status = status;

    // Update data field with new values
    const updatedData = { ...finalReport.data };
    if (executiveSummary !== undefined) updatedData.executiveSummary = executiveSummary;
    if (achievements !== undefined) updatedData.achievements = achievements;
    if (challenges !== undefined) updatedData.challenges = challenges;
    if (recommendations !== undefined) updatedData.recommendations = recommendations;
    
    updates.data = updatedData;

    await finalReport.update(updates);

    res.json({
      success: true,
      message: "Laporan akhir berhasil diperbarui",
      data: finalReport
    });
  } catch (error) {
    console.error("Error updating final report:", error);
    res.status(500).json({
      success: false,
      error: "Gagal memperbarui laporan akhir"
    });
  }
};

// Delete final report
export const deleteFinalReport = async (req, res) => {
  try {
    const { id } = req.params;

    const finalReport = await FinalReport.findByPk(id);
    if (!finalReport) {
      return res.status(404).json({
        success: false,
        error: "Laporan akhir tidak ditemukan"
      });
    }

    await finalReport.destroy();

    res.json({
      success: true,
      message: "Laporan akhir berhasil dihapus"
    });
  } catch (error) {
    console.error("Error deleting final report:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus laporan akhir"
    });
  }
};

// Generate PDF for a final report
export const downloadFinalReportPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const finalReport = await FinalReport.findByPk(id, {
      include: [
        {
          model: School,
          attributes: ['id', 'name', 'kabupaten', 'location', 'nilaiBanper', 'durasi', 'startDate', 'finishDate']
        },
        {
          model: User,
          as: 'generator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!finalReport) {
      return res.status(404).json({
        success: false,
        error: "Laporan akhir tidak ditemukan"
      });
    }

    // Generate PDF
    const pdfBuffer = await generateFinalReportPDF(finalReport);

    // Set headers for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=laporan-akhir-${finalReport.School.name}-${finalReport.periodStart.toISOString().split('T')[0]}-${finalReport.periodEnd.toISOString().split('T')[0]}.pdf`
    );

    // Send PDF as response
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating final report PDF:", error);
    res.status(500).json({
      success: false,
      error: "Gagal generate PDF laporan akhir"
    });
  }
};

// Export all final reports in one PDF
export const exportFinalReportsPDF = async (req, res) => {
  try {
    const { schoolId, status } = req.query;

    let whereClause = {};
    if (schoolId) whereClause.schoolId = schoolId;
    if (status) whereClause.status = status;

    const reports = await FinalReport.findAll({
      where: whereClause,
      include: [
        {
          model: School,
          attributes: ['id', 'name', 'kabupaten', 'location']
        }
      ],
      order: [[School, 'name', 'ASC']]
    });

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Tidak ada data laporan akhir"
      });
    }

    // Generate PDF
    const pdfBuffer = await generateFinalReportsPDF(reports);

    // Set headers for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=laporan-akhir-${new Date().toISOString().split('T')[0]}.pdf`
    );

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error exporting final reports PDF:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengekspor PDF laporan akhir"
    });
  }
};