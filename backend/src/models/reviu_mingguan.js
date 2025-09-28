import { DataTypes } from "sequelize";
import db from "../config/database.js";
import School from "./school.js"; 

const ReviewMingguan = db.define(
  "ReviewMingguan",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sekolah_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: School,
        key: "id",
      },
    },
    minggu_ke: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {
        min: 1,
        max: 52,
      },
    },
    rencana_progress: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    realisasi_progress: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    top_masalah: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: "5 masalah teknis teratas",
    },
    pdf_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "revieu_mingguan",
    timestamps: false,
  }
);

// Relasi ke School
ReviewMingguan.belongsTo(School, { foreignKey: "sekolah_id" });

export default ReviewMingguan;
