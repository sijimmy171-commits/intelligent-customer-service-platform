const express = require('express');
const router = express.Router();
const knowledgeBaseController = require('../controllers/knowledgeBaseController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, knowledgeBaseController.getAll);
router.get('/:id', authMiddleware, knowledgeBaseController.getById);
router.post('/', authMiddleware, adminMiddleware, knowledgeBaseController.create);
router.put('/:id', authMiddleware, adminMiddleware, knowledgeBaseController.update);
router.delete('/:id', authMiddleware, adminMiddleware, knowledgeBaseController.delete);

module.exports = router;
