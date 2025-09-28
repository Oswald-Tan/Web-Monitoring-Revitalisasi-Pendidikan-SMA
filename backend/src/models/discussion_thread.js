import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import School from './school.js';
import User from './user.js';

const DiscussionThread = sequelize.define('DiscussionThread', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  schoolId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: School,
      key: 'id'
    }
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isClosed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'discussion_threads',
  timestamps: true
});

DiscussionThread.belongsTo(School, { foreignKey: 'schoolId' });
DiscussionThread.belongsTo(User, { foreignKey: 'createdBy', as: 'author' });
School.hasMany(DiscussionThread, { foreignKey: 'schoolId' });
User.hasMany(DiscussionThread, { foreignKey: 'createdBy' });

export default DiscussionThread;