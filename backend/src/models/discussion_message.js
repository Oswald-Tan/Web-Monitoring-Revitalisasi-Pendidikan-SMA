import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import DiscussionThread from './discussion_thread.js';
import User from './user.js';

const DiscussionMessage = sequelize.define('DiscussionMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  threadId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DiscussionThread,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'discussion_messages',
      key: 'id'
    }
  }
}, {
  tableName: 'discussion_messages',
  timestamps: true
});

// Asosiasi
DiscussionMessage.belongsTo(DiscussionThread, { foreignKey: 'threadId' });
DiscussionMessage.belongsTo(User, { foreignKey: 'userId', as: 'author' });
DiscussionMessage.belongsTo(DiscussionMessage, { 
  foreignKey: 'parentId', 
  as: 'parent' 
});

// Tambahkan asosiasi untuk balasan (replies)
DiscussionMessage.hasMany(DiscussionMessage, {
  foreignKey: 'parentId',
  as: 'replies'
});

DiscussionThread.hasMany(DiscussionMessage, { foreignKey: 'threadId' });
User.hasMany(DiscussionMessage, { foreignKey: 'userId' });

export default DiscussionMessage;