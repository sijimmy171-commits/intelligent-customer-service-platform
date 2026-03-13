const { ChatSession, Message, Document } = require('../models');
const axios = require('axios');

// 智谱 AI API 配置
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// RAG 检索函数
const searchKnowledgeBase = async (query) => {
  try {
    const documents = await Document.findAll({
      where: { status: 'indexed' }
    });

    const results = [];
    const queryWords = query.toLowerCase().split(/\s+/);

    for (const doc of documents) {
      if (!doc.content) continue;

      const content = doc.content.toLowerCase();
      let matchCount = 0;

      for (const word of queryWords) {
        if (word.length > 1 && content.includes(word)) {
          matchCount++;
        }
      }

      if (matchCount > 0) {
        // 提取相关片段
        const sentences = doc.content.split(/[。！？.!?]/);
        const relevantSentences = sentences.filter(s => {
          const lowerS = s.toLowerCase();
          return queryWords.some(w => w.length > 1 && lowerS.includes(w));
        }).slice(0, 3);

        if (relevantSentences.length > 0) {
          results.push({
            documentId: doc.id,
            documentName: doc.name,
            content: relevantSentences.join('。'),
            relevance: matchCount / queryWords.length
          });
        }
      }
    }

    // 按相关度排序，返回前3个
    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 3);
  } catch (error) {
    console.error('RAG检索失败:', error);
    return [];
  }
};

// 调用智谱 AI
const callZhipuAI = async (messages, knowledgeContext) => {
  try {
    let systemPrompt = '你是智能客服助手，请用中文回答用户问题。';
    
    if (knowledgeContext) {
      systemPrompt += `\n\n请参考以下知识库内容回答问题，如果知识库中没有相关信息，请基于你的知识自主回答：\n\n${knowledgeContext}`;
    }

    const response = await axios.post(ZHIPU_API_URL, {
      model: 'glm-4-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 2000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZHIPU_API_KEY}`
      }
    });

    return response.data.choices[0]?.message?.content || '抱歉，我暂时无法回答这个问题。';
  } catch (error) {
    console.error('智谱AI调用失败:', error);
    return '抱歉，服务暂时不可用，请稍后再试。';
  }
};

exports.getSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.findAll({
      where: { userId: req.user.id },
      order: [['updatedAt', 'DESC']]
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: '获取会话失败', message: error.message });
  }
};

exports.createSession = async (req, res) => {
  try {
    const session = await ChatSession.create({
      userId: req.user.id,
      title: '新对话'
    });

    // 创建欢迎消息
    await Message.create({
      sessionId: session.id,
      role: 'assistant',
      content: '您好！我是您的智能客服助手。基于 Zhipu AI 和 RAG (检索增强生成) 技术，我可以为您提供基于企业私有知识库的精准解答。\n\n请问今天有什么可以帮您的？'
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: '创建会话失败', message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await ChatSession.findOne({
      where: { id: sessionId, userId: req.user.id }
    });

    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }

    const messages = await Message.findAll({
      where: { sessionId },
      order: [['createdAt', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: '获取消息失败', message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content } = req.body;

    const session = await ChatSession.findOne({
      where: { id: sessionId, userId: req.user.id }
    });

    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }

    // 保存用户消息
    await Message.create({
      sessionId,
      role: 'user',
      content
    });

    // 更新会话标题（如果是第一条消息）
    if (session.title === '新对话') {
      await session.update({ title: content.slice(0, 20) });
    }

    // RAG 检索
    const sources = await searchKnowledgeBase(content);
    const knowledgeContext = sources.length > 0 
      ? sources.map((s, i) => `[${i + 1}] 来自《${s.documentName}》：\n${s.content}`).join('\n\n')
      : '';

    // 获取历史消息
    const historyMessages = await Message.findAll({
      where: { sessionId },
      order: [['createdAt', 'ASC']],
      limit: 10
    });

    const messagesForAI = historyMessages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // 调用 AI
    const aiResponse = await callZhipuAI(messagesForAI, knowledgeContext);

    // 保存 AI 回复
    const assistantMessage = await Message.create({
      sessionId,
      role: 'assistant',
      content: aiResponse,
      sources: sources.length > 0 ? sources : null
    });

    res.json(assistantMessage);
  } catch (error) {
    res.status(500).json({ error: '发送消息失败', message: error.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findOne({
      where: { id: sessionId, userId: req.user.id }
    });

    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }

    await session.destroy();
    res.json({ message: '会话已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除会话失败', message: error.message });
  }
};
