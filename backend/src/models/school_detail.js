import { DataTypes } from "sequelize";
import db from "../config/database.js";
import School from "./school.js";

const SchoolDetail = db.define(
  "SchoolDetail",
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
    ded_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Path file DED (misal: /docs/ded_sekolahA.pdf)",
    },
    rab_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Path file RAB",
    },
    foto_progress: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array path foto [30%, 50%, 100%]",
    },
    catatan_masalah: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    rekomendasi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    last_updated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "sekolah_detail",
    timestamps: false,
  }
);

SchoolDetail.belongsTo(School, { foreignKey: "sekolah_id" });
School.hasOne(SchoolDetail, { foreignKey: "sekolah_id" });

export default SchoolDetail;
