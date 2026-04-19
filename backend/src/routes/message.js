const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
    sendMessage,
    getConversations,
    getMessages,
    markAsRead,
    getUnreadCount
} = require('../controllers/messageController');

// All routes require authentication
router.use(protect);

// Message routes
router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/unread', getUnreadCount);
router.get('/:conversationId', getMessages);
router.patch('/:conversationId/read', markAsRead);

module.exports = router;
