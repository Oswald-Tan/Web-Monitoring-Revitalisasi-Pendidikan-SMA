import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./user.js";

const DetailsUsers = db.define(
  "DetailsUsers",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // satu user hanya punya satu detail
    },
    nip: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    jabatan: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    photo_profile: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "details_users",
  }
);

User.hasOne(DetailsUsers, { foreignKey: "user_id", as: "userDetails" });
DetailsUsers.belongsTo(User, { foreignKey: "user_id", as: "user" });

export default DetailsUsers;
