import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.js";
import School from "./school.js";

const Assignment = sequelize.define(
  "Assignment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    facilitator_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    school_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: School,
        key: "id",
      },
    },
    assigned_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "pending"),
      defaultValue: "active",
    },
  },
  {
    tableName: "assignments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Define associations
Assignment.belongsTo(User, { foreignKey: "facilitator_id", as: "facilitator" });
Assignment.belongsTo(School, { foreignKey: "school_id", as: "school" });
Assignment.belongsTo(User, { foreignKey: "assigned_by", as: "assigner" });

User.hasMany(Assignment, { foreignKey: "facilitator_id", as: "assignments" });
School.hasMany(Assignment, { foreignKey: "school_id", as: "assignments" });

export default Assignment;