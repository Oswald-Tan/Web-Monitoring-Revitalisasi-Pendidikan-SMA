import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./user.js";

const AuditLog = db.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  entity: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  oldData: {
    type: DataTypes.JSON,
    allowNull: true
  },
  newData: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  userAgent: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default AuditLog;