import { DataTypes } from "sequelize";
import db from "../config/database.js";
import School from "./school.js";
import User from "./user.js";

const LaporanAkhir = db.define(
  "LaporanAkhir",
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
    konten_kustom: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Section tambahan (opsional)",
    },
    pdf_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Path file PDF laporan akhir",
    },
    published_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    published_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "laporan_akhir",
    timestamps: false, 
  }
);

// Relasi
LaporanAkhir.belongsTo(School, { foreignKey: "sekolah_id" });
School.hasMany(LaporanAkhir, { foreignKey: "sekolah_id" });

LaporanAkhir.belongsTo(User, { foreignKey: "published_by" });
User.hasMany(LaporanAkhir, { foreignKey: "published_by" });

export default LaporanAkhir;
