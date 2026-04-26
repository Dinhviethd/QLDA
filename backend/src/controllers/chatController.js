const chatService = require('../services/chatService');
const pool = require('../config/database');

exports.sendMessage = async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = req.userId;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get AI response
    const response = await chatService.sendMessage(message, context);

    // Save to chat history
    await pool.query(
      'INSERT INTO chat_history (user_id, message, response, context) VALUES ($1, $2, $3, $4)',
      [userId, message, response, context || null]
    );

    res.json({
      message: 'Message processed',
      response
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      'SELECT id, message, response, context, created_at FROM chat_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId]
    );

    res.json({
      messages: result.rows
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};
