import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import School from './school.js';
import User from './user.js';

const CalendarEvent = sequelize.define('CalendarEvent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  schoolId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: School,
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  eventType: {
    type: DataTypes.ENUM('site_visit', 'meeting', 'qc_check', 'other'),
    defaultValue: 'other'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  participants: {
    type: DataTypes.JSON,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  }
}, {
  tableName: 'calendar_events',
  timestamps: true
});

CalendarEvent.belongsTo(School, { foreignKey: 'schoolId' });
CalendarEvent.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
School.hasMany(CalendarEvent, { foreignKey: 'schoolId' });
User.hasMany(CalendarEvent, { foreignKey: 'createdBy' });

export default CalendarEvent;