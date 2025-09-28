import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./user.js";

const School = db.define(
  "School",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kabupaten: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    progress: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    coordinates: {
      type: DataTypes.GEOMETRY("POINT"),
      allowNull: true,
    },
    admin_id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("on-track", "delayed", "completed"),
      defaultValue: "on-track",
    },
    nilaiBanper: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    durasi: {
      type: DataTypes.INTEGER, // dalam hari
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    finishDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "schools",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);


School.belongsTo(User, { foreignKey: "admin_id", as: "Admin" });
User.hasMany(School, { foreignKey: "admin_id", as: "AdminSchools" });

export default School;
