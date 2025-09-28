import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import School from './school.js';

const RabItem = sequelize.define('RabItem', {
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
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  itemNo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  uraian: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  volume: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  satuan: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bobot: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  building: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'rab_items',
  timestamps: true
});

RabItem.belongsTo(School, { foreignKey: 'schoolId' });
School.hasMany(RabItem, { foreignKey: 'schoolId' });

export default RabItem;