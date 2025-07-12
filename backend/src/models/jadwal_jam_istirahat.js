import { DataTypes } from "sequelize";
import db from "../config/database.js";

const JadwalJamIstirahat = db.define(
  "JadwalJamIstirahat",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
     jamMulaiIstirahat: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    jamSelesaiIstirahat: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    prodi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "jadwal_jam_kuliah",
    timestamps: false,
  }
);

export default JadwalJamIstirahat;
