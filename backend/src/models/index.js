const sequelize = require('../config/database');
const User = require('./User');
const KnowledgeBase = require('./KnowledgeBase');
const Document = require('./Document');
const ChatSession = require('./ChatSession');
const Message = require('./Message');

// 定义关联关系
KnowledgeBase.hasMany(Document, { foreignKey: 'knowledgeBaseId', onDelete: 'CASCADE' });
Document.belongsTo(KnowledgeBase, { foreignKey: 'knowledgeBaseId' });

User.hasMany(ChatSession, { foreignKey: 'userId', onDelete: 'CASCADE' });
ChatSession.belongsTo(User, { foreignKey: 'userId' });

ChatSession.hasMany(Message, { foreignKey: 'sessionId', onDelete: 'CASCADE' });
Message.belongsTo(ChatSession, { foreignKey: 'sessionId' });

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Database synchronization failed:', error);
  }
};

module.exports = {
  sequelize,
  User,
  KnowledgeBase,
  Document,
  ChatSession,
  Message,
  syncDatabase
};
