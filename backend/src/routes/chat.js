const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/auth');

router.get('/sessions', authMiddleware, chatController.getSessions);
router.post('/sessions', authMiddleware, chatController.createSession);
router.get('/sessions/:sessionId/messages', authMiddleware, chatController.getMessages);
router.post('/sessions/:sessionId/messages', authMiddleware, chatController.sendMessage);
router.delete('/sessions/:sessionId', authMiddleware, chatController.deleteSession);

module.exports = router;
