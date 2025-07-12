import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Kelas = db.define(
  "Kelas",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama_kelas: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    prodi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tgl_create: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
  },
  {
    tableName: "kelas",
    timestamps: false,
  }
);

export default Kelas;
