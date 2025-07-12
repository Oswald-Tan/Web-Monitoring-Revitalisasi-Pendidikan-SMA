import { DataTypes } from "sequelize";
import db from "../config/database.js";
import Matkul from "./matkul.js";
import Kelas from "./kelas.js";
import { Dosen } from "./dosen.js";

const JadwalMatkul = db.define(
  "JadwalMatkul",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
     prodiAdmin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idMatkul: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idKelas: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dosen_pengajar: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hari: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ruangan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jam_matkul: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "jadwal_matkul",
    timestamps: false,
  }
);

Matkul.hasMany(JadwalMatkul, { foreignKey: "id" });
JadwalMatkul.belongsTo(Matkul, { foreignKey: "idMatkul" });

Kelas.hasMany(JadwalMatkul, { foreignKey: "id" });
JadwalMatkul.belongsTo(Kelas, { foreignKey: "idKelas" });

Dosen.hasMany(JadwalMatkul, { foreignKey: "dosen_pengajar" });
JadwalMatkul.belongsTo(Dosen, { foreignKey: "dosen_pengajar" });

export default JadwalMatkul;
