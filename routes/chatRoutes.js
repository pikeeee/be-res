const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Get chat history
router.get('/:userId', chatController.getChatHistory);

// Send a message
router.post('/:userId', chatController.sendMessage);

module.exports = router;
