import TimeSchedule from "../models/time_schedule.js";
import School from "../models/school.js";
import DailyReport from "../models/daily_report.js";
import RabItem from "../models/rab_item.js";

// Generate time schedule data based on RAB and actual progress
export const generateTimeSchedule = async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    // Get school data
    const school = await School.findByPk(schoolId);
    if (!school) {
      return res.status(404).json({ error: "Sekolah tidak ditemukan" });
    }

    // Get all RAB items for the school
    const rabItems = await RabItem.findAll({
      where: { schoolId },
      order: [["category", "ASC"], ["itemNo", "ASC"]],
    });

    // Calculate total weight
    const totalBobot = rabItems.reduce(
      (sum, item) => sum + (item.bobot || 0),
      0
    );

    // Calculate actual progress per month
    const monthlyProgress = {};
    
    // Get all daily reports for the school
    const dailyReports = await DailyReport.findAll({
      where: { schoolId },
      include: [{
        model: RabItem,
        attributes: ["id", "bobot"]
      }],
      order: [["tanggal", "ASC"]],
    });

    // Group progress by month
    dailyReports.forEach((report) => {
      const date = new Date(report.tanggal);
      const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
      
      if (!monthlyProgress[monthYear]) {
        monthlyProgress[monthYear] = {
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          actual: 0,
        };
      }
      
      // Calculate progress contribution based on item weight
      const bobotItem = report.RabItem ? report.RabItem.bobot : 0;
      if (bobotItem > 0) {
        const progressContribution = (report.progress / 100) * (bobotItem / totalBobot) * 100;
        monthlyProgress[monthYear].actual += progressContribution;
      }
    });

    // Calculate planned progress (S-Curve formula)
    const startDate = new Date(school.startDate);
    const finishDate = new Date(school.finishDate);
    
    // Calculate duration in months
    const monthDiff = (finishDate.getFullYear() - startDate.getFullYear()) * 12 +
      (finishDate.getMonth() - startDate.getMonth()) + 1;

    const plannedData = [];
    
    // Improved S-Curve calculation
    for (let i = 0; i < monthDiff; i++) {
      const monthDate = new Date(startDate);
      monthDate.setMonth(startDate.getMonth() + i);
      
      // Standard S-Curve formula for construction projects
      const t = i / Math.max(1, monthDiff - 1);
      const planned = 100 * (1 / (1 + Math.exp(-8 * (t - 0.5))));
      
      plannedData.push({
        month: monthDate.getMonth() + 1,
        year: monthDate.getFullYear(),
        planned: parseFloat(planned.toFixed(2)),
      });
    }

    // Combine planned and actual data
    const timeScheduleData = plannedData.map((plannedItem) => {
      const monthYear = `${plannedItem.month}-${plannedItem.year}`;
      const actualItem = monthlyProgress[monthYear] || { actual: 0 };
      
      return {
        schoolId,
        month: plannedItem.month,
        year: plannedItem.year,
        plannedProgress: plannedItem.planned,
        actualProgress: parseFloat(actualItem.actual.toFixed(2)),
        variance: parseFloat((actualItem.actual - plannedItem.planned).toFixed(2)),
      };
    });

    // Save to database
    await TimeSchedule.destroy({ where: { schoolId } });
    const savedData = await TimeSchedule.bulkCreate(timeScheduleData);

    res.json({
      success: true,
      message: "Time schedule berhasil digenerate",
      data: savedData,
    });

  } catch (error) {
    console.error("Error generating time schedule:", error);
    res.status(500).json({ error: "Gagal generate time schedule" });
  }
};

// Get time schedule data for a school
export const getTimeSchedule = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const timeSchedule = await TimeSchedule.findAll({
      where: { schoolId },
      order: [
        ["year", "ASC"],
        ["month", "ASC"],
      ],
    });

    res.json({
      success: true,
      data: timeSchedule,
    });
  } catch (error) {
    console.error("Error fetching time schedule:", error);
    res.status(500).json({ error: "Gagal mengambil data time schedule" });
  }
};

// Update time schedule manually (if needed)
export const updateTimeSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { plannedProgress, actualProgress } = req.body;

    const timeSchedule = await TimeSchedule.findByPk(id);
    if (!timeSchedule) {
      return res
        .status(404)
        .json({ error: "Data time schedule tidak ditemukan" });
    }

    if (plannedProgress !== undefined)
      timeSchedule.plannedProgress = plannedProgress;
    if (actualProgress !== undefined)
      timeSchedule.actualProgress = actualProgress;

    if (plannedProgress !== undefined || actualProgress !== undefined) {
      timeSchedule.variance =
        timeSchedule.actualProgress - timeSchedule.plannedProgress;
    }

    await timeSchedule.save();

    res.json({
      success: true,
      message: "Time schedule berhasil diperbarui",
      data: timeSchedule,
    });
  } catch (error) {
    console.error("Error updating time schedule:", error);
    res.status(500).json({ error: "Gagal memperbarui time schedule" });
  }
};
