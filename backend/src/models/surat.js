import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./user.js";

const Surat = db.define('Surat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  jenis_surat: {
    type: DataTypes.ENUM('masuk', 'keluar'),
    allowNull: false
  },
  nomor_surat: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  perihal: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tanggal_surat: {
    type: DataTypes.DATE,
    allowNull: false
  },
  asal_tujuan: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'draft', 
      'menunggu_persetujuan', 
      'disetujui', 
      'ditolak', 
      'selesai'
    ),
    defaultValue: 'draft'
  },
  disposisi: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  tableName: 'surat',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['nomor_surat']
    },
    {
      fields: ['tanggal_surat']
    },
    {
      fields: ['status']
    }
  ]
});

export default Surat;