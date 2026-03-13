const { KnowledgeBase, Document } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const knowledgeBases = await KnowledgeBase.findAll({
      include: [{
        model: Document,
        attributes: ['id', 'status']
      }]
    });

    // 添加文档计数
    const result = knowledgeBases.map(kb => ({
      ...kb.toJSON(),
      documentCount: kb.Documents?.length || 0
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '获取知识库失败', message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const knowledgeBase = await KnowledgeBase.findByPk(id, {
      include: [Document]
    });

    if (!knowledgeBase) {
      return res.status(404).json({ error: '知识库不存在' });
    }

    res.json(knowledgeBase);
  } catch (error) {
    res.status(500).json({ error: '获取知识库失败', message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;

    const knowledgeBase = await KnowledgeBase.create({
      name,
      description
    });

    res.status(201).json(knowledgeBase);
  } catch (error) {
    res.status(500).json({ error: '创建知识库失败', message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const knowledgeBase = await KnowledgeBase.findByPk(id);
    if (!knowledgeBase) {
      return res.status(404).json({ error: '知识库不存在' });
    }

    await knowledgeBase.update({ name, description, status });
    res.json(knowledgeBase);
  } catch (error) {
    res.status(500).json({ error: '更新知识库失败', message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const knowledgeBase = await KnowledgeBase.findByPk(id);
    if (!knowledgeBase) {
      return res.status(404).json({ error: '知识库不存在' });
    }

    await knowledgeBase.destroy();
    res.json({ message: '知识库已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除知识库失败', message: error.message });
  }
};
