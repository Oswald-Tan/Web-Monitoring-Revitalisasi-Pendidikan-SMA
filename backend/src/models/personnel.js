import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.js";

const Personnel = sequelize.define(
  "Personnel",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      unique: true,
    },
    qualifications: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Kualifikasi pendidikan dan pengalaman",
    },
    certifications: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Sertifikasi yang dimiliki",
    },
    zone: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Zona tugas/wilayah kerja",
    },
    assigned_schools: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Daftar sekolah yang ditugaskan",
    },
    cv_path: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Path file CV",
    },
    additional_info: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Informasi tambahan dalam format JSON",
    },
  },
  {
    tableName: "personnel",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Definisikan relasi
Personnel.belongsTo(User, { foreignKey: "user_id" });
User.hasOne(Personnel, { foreignKey: "user_id" });

export default Personnel;