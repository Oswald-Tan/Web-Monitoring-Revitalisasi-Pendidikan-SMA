// models/user_school.js
import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./user.js";
import School from "./school.js";

const UserSchool = db.define(
  "UserSchool",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    school_id: {
      type: DataTypes.INTEGER,
      references: {
        model: School,
        key: "id",
      },
    },
  },
  {
    tableName: "user_schools",
    timestamps: false,
  }
);

export default UserSchool;