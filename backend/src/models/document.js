import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Document = db.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('SOP', 'Form Pengajuan', 'Laporan'),
    allowNull: false
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  access_roles: {
    type: DataTypes.STRING(255), // Simpan roles yang diizinkan (misal: "admin,dosen")
    defaultValue: "admin"
  }
}, {
  tableName: 'documents',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Document;