const { Document } = require('../models');
const path = require('path');
const fs = require('fs');

exports.getByKnowledgeBase = async (req, res) => {
  try {
    const { knowledgeBaseId } = req.params;
    const documents = await Document.findAll({
      where: { knowledgeBaseId }
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: '获取文档失败', message: error.message });
  }
};

exports.upload = async (req, res) => {
  try {
    const { knowledgeBaseId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    // 读取文件内容
    let content = '';
    const filePath = file.path;
    const fileExt = path.extname(file.originalname).toLowerCase();

    try {
      if (fileExt === '.pdf') {
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(fs.readFileSync(filePath));
        content = data.text;
      } else if (fileExt === '.docx' || fileExt === '.doc') {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ path: filePath });
        content = result.value;
      } else {
        // txt, md 等文本文件
        content = fs.readFileSync(filePath, 'utf-8');
      }
    } catch (err) {
      console.error('文件解析失败:', err);
    }

    const document = await Document.create({
      knowledgeBaseId,
      name: file.originalname,
      type: fileExt.replace('.', ''),
      size: file.size,
      status: 'indexed',
      content,
      filePath
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: '上传文档失败', message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({ error: '文档不存在' });
    }

    // 删除文件
    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await document.destroy();
    res.json({ message: '文档已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除文档失败', message: error.message });
  }
};
