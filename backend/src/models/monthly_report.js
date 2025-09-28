import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import School from './school.js';
import User from './user.js';

const MonthlyReport = sequelize.define('MonthlyReport', {
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
  progress: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  plannedProgress: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  variance: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('on-track', 'delayed', 'completed'),
    defaultValue: 'on-track'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  generatedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false
  },
  files: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'monthly_reports',
  timestamps: true
});

MonthlyReport.belongsTo(School, { foreignKey: 'schoolId' });
MonthlyReport.belongsTo(User, { foreignKey: 'generatedBy', as: 'generator' });

School.hasMany(MonthlyReport, { foreignKey: 'schoolId' });
User.hasMany(MonthlyReport, { foreignKey: 'generatedBy' });

export default MonthlyReport;