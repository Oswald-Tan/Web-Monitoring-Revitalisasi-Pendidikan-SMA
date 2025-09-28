import { DataTypes } from "sequelize";
import db from "../config/database.js";

const User = db.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
     status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
    foto_profil: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Path foto profil",
    },
    preferensi_notif: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Pengaturan notifikasi (misal: {"email": true, "sms": false})',
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Timestamp login terakhir",
    },
    resetOtp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetOtpExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "users",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User;
