import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Notification = db.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'events',
      key: 'id'
    }
  },
  recipient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  channel: {
    type: DataTypes.ENUM('email', 'whatsapp'),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('invitation', 'reminder'),
    defaultValue: 'invitation'
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed'),
    defaultValue: 'pending'
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});



export default Notification;