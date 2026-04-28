const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
// router.use(authMiddleware);

router.post('/', chatController.sendMessage);
router.get('/history', chatController.getChatHistory);

module.exports = router;
