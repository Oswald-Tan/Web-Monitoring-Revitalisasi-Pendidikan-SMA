import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import School from './school.js';

const TimeSchedule = sequelize.define('TimeSchedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  schoolId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: School,
      key: 'id'
    }
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  plannedProgress: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  actualProgress: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  variance: {
    type: DataTypes.FLOAT,
    allowNull: true
  }
}, {
  tableName: 'time_schedules',
  timestamps: true
});

TimeSchedule.belongsTo(School, { foreignKey: 'schoolId' });
School.hasMany(TimeSchedule, { foreignKey: 'schoolId' });

export default TimeSchedule;