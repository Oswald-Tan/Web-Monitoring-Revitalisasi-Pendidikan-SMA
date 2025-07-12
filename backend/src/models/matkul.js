import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Matkul = db.define(
  "Matkul",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    mata_kuliah: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    prodi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kode_matkul: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "mata_kuliah",
    timestamps: false,
  }
);

export default Matkul;
