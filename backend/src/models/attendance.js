import { DataTypes } from "sequelize";
import db from "../config/database.js";


const Attendance = db.define('Attendance', {
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
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('hadir', 'tidak_hadir', 'izin'),
    defaultValue: 'tidak_hadir'
  },
  notes: { 
    type: DataTypes.TEXT,
    allowNull: true
  },
  reminder_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false 
  },
  attended_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'attendances',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});


export default Attendance;