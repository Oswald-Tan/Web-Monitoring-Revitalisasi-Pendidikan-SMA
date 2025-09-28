import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import School from './school.js';
import User from './user.js';

const WeeklyReview = sequelize.define('WeeklyReview', {
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
  weekNumber: {
    type: DataTypes.INTEGER,  
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  reviewedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'approved'),
    defaultValue: 'draft'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'weekly_reviews',
  timestamps: true
});

WeeklyReview.belongsTo(School, { foreignKey: 'schoolId' });
WeeklyReview.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

School.hasMany(WeeklyReview, { foreignKey: 'schoolId' });
User.hasMany(WeeklyReview, { foreignKey: 'reviewedBy' });

export default WeeklyReview;