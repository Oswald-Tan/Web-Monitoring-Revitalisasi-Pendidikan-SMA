import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import School from './school.js';
import User from './user.js';

const FinalReport = sequelize.define('FinalReport', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Laporan Akhir Revitalisasi'
  },
  generatedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  periodStart: {
    type: DataTypes.DATE,
    allowNull: false
  },
  periodEnd: {
    type: DataTypes.DATE,
    allowNull: false
  },
  executiveSummary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  achievements: {
    type: DataTypes.JSON,
    allowNull: true
  },
  challenges: {
    type: DataTypes.JSON,
    allowNull: true
  },
  recommendations: {
    type: DataTypes.JSON,
    allowNull: true
  },
  financialSummary: {
    type: DataTypes.JSON,
    allowNull: true
  },
  physicalProgressSummary: {
    type: DataTypes.JSON,
    allowNull: true
  },
  documents: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'approved', 'published'),
    defaultValue: 'draft'
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
  tableName: 'final_reports',
  timestamps: true
});

FinalReport.belongsTo(School, { foreignKey: 'schoolId' });
FinalReport.belongsTo(User, { foreignKey: 'generatedBy', as: 'generator' });
School.hasMany(FinalReport, { foreignKey: 'schoolId' });
User.hasMany(FinalReport, { foreignKey: 'generatedBy' });

export default FinalReport;