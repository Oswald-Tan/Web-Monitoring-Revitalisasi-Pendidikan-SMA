import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Arsip = db.define('Arsip', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  judul: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  jenis: {
    type: DataTypes.ENUM('surat', 'kegiatan', 'pengajuan'),
    allowNull: false
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  nomor_dokumen: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  tanggal: {
    type: DataTypes.DATE,
    allowNull: false
  },
  pihak_terkait: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'diterima', 'ditolak', 'selesai'),
    defaultValue: 'draft'
  },
  file_path: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'arsip',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Arsip;