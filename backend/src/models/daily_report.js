import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import RabItem from "./rab_item.js";
import School from "./school.js";
import User from "./user.js";

const DailyReport = sequelize.define(
  "DailyReport",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    schoolId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: School,
        key: "id",
      },
    },
    rabItemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: RabItem,
        key: "id",
      },
    },
    tanggal: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    progress: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    volumeRealisasi: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    bobotRealisasi: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    files: { //dokumentasi
      type: DataTypes.JSON,
      allowNull: true,
    },
    checklist: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    statusReview: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    catatanReview: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "daily_reports",
    timestamps: true,
  }
);

DailyReport.belongsTo(School, { foreignKey: "schoolId" });
DailyReport.belongsTo(RabItem, { foreignKey: "rabItemId" });

School.hasMany(DailyReport, { foreignKey: "schoolId" });
RabItem.hasMany(DailyReport, { foreignKey: "rabItemId" });

DailyReport.belongsTo(User, { foreignKey: "reviewedBy", as: "reviewer" });
User.hasMany(DailyReport, { foreignKey: "reviewedBy" });

// Fungsi untuk menghitung progress sekolah
async function updateSchoolProgress(schoolId) {
  try {
    // Dapatkan semua item RAB untuk sekolah ini dengan bobotnya
    const rabItems = await RabItem.findAll({
      where: { schoolId },
      attributes: ["id", "bobot"],
    });

    // Jika tidak ada item RAB, set progress ke 0
    if (rabItems.length === 0) {
      await School.update(
        { progress: 0, status: "on-track" },
        { where: { id: schoolId } }
      );
      return;
    }

    // Hitung total bobot (hanya item dengan bobot > 0)
    const totalBobot = rabItems.reduce(
      (sum, item) => sum + (item.bobot || 0),
      0
    );

    // Jika total bobot 0, set progress ke 0
    if (totalBobot === 0) {
      await School.update(
        { progress: 0, status: "on-track" },
        { where: { id: schoolId } }
      );
      return;
    }

    let totalWeightedProgress = 0;
    let itemsWithProgress = 0;

    // Untuk setiap item RAB, dapatkan progress terbaru
    for (const item of rabItems) {
      if (item.bobot > 0) {
        // Hanya item dengan bobot > 0
        // Dapatkan laporan terbaru untuk item ini
        const latestReport = await DailyReport.findOne({
          where: {
            schoolId,
            rabItemId: item.id,
          },
          order: [["tanggal", "DESC"]],
          attributes: ["progress"],
        });

        // Hitung kontribusi progress item ini (progress * bobot)
        const itemProgress = latestReport ? latestReport.progress : 0;
        totalWeightedProgress += (itemProgress / 100) * item.bobot;
        itemsWithProgress++;
      }
    }

    // Hitung progress keseluruhan
    const overallProgress = Math.round(
      (totalWeightedProgress / totalBobot) * 100
    );

    // Update progress di tabel schools
    await School.update(
      { progress: overallProgress },
      { where: { id: schoolId } }
    );

    // Update status berdasarkan progress
    let status = "on-track";
    if (overallProgress >= 100) {
      status = "completed";
    } else if (overallProgress < 70) {
      // Hitung progress yang diharapkan berdasarkan waktu
      const school = await School.findByPk(schoolId);
      if (school.startDate && school.finishDate) {
        const totalDuration =
          new Date(school.finishDate) - new Date(school.startDate);
        const elapsedDuration = new Date() - new Date(school.startDate);
        const expectedProgress = Math.min(
          100,
          (elapsedDuration / totalDuration) * 100
        );

        if (overallProgress < expectedProgress * 0.7) {
          status = "delayed";
        }
      } else {
        // Fallback jika tidak ada tanggal
        if (overallProgress < 70) {
          status = "delayed";
        }
      }
    }

    await School.update({ status }, { where: { id: schoolId } });
  } catch (error) {
    console.error("Error in updateSchoolProgress:", error);
    throw error;
  }
}

// Tambahkan hooks setelah definisi model
DailyReport.afterCreate(async (dailyReport, options) => {
  try {
    await updateSchoolProgress(dailyReport.schoolId);
  } catch (error) {
    console.error("Error updating school progress after create:", error);
  }
});

DailyReport.afterUpdate(async (dailyReport, options) => {
  try {
    await updateSchoolProgress(dailyReport.schoolId);
  } catch (error) {
    console.error("Error updating school progress after update:", error);
  }
});

DailyReport.afterDestroy(async (dailyReport, options) => {
  try {
    await updateSchoolProgress(dailyReport.schoolId);
  } catch (error) {
    console.error("Error updating school progress after destroy:", error);
  }
});

export default DailyReport;
