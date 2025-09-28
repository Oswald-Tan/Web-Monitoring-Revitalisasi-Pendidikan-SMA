import { DataTypes } from "sequelize";
import db from "../config/database.js";
import School from "./school.js";
import User from "./user.js";

const PembagianTugas = db.define(
  "PembagianTugas",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sekolah_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: School,
        key: "id",
      },
      comment: "ID sekolah",
    },
    fasilitator_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
      comment: "ID fasilitator",
    },
    assigned_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      comment: "ID admin penugasan",
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "Waktu penugasan",
    },
  },
  {
    tableName: "pembagian_tugas",
    timestamps: false,
  }
);

// Relasi
PembagianTugas.belongsTo(School, { foreignKey: "sekolah_id" });
PembagianTugas.belongsTo(User, { as: "Fasilitator", foreignKey: "fasilitator_id" });
PembagianTugas.belongsTo(User, { as: "AdminPenugasan", foreignKey: "assigned_by" });

export default PembagianTugas;
