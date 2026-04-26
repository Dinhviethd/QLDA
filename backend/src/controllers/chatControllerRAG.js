const chatService = require('../services/chatService');
const ragService = require('../services/ragService');
const pool = require('../config/database');

/**
 * Enhanced Chat Controller with RAG
 * Provides intelligent chat responses using document context
 */

exports.sendMessage = async (req, res) => {
  try {
    const { message, context = '' } = req.body;
    const userId = req.userId;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Execute RAG pipeline to get augmented response
    const ragResult = await ragService.executeRAGPipeline(message);

    // Save message to chat history
    const saveQuery = `
      INSERT INTO chat_history (user_id, user_message, ai_response, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, user_message, ai_response, created_at
    `;

    const saveResult = await pool.query(saveQuery, [
      userId,
      message,
      ragResult.response
    ]);

    res.json({
      message: ragResult.response,
      sources: ragResult.sourceDocuments,
      timestamp: saveResult.rows[0].created_at,
      chatId: saveResult.rows[0].id
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT id, user_message, ai_response, created_at
      FROM chat_history
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [userId, parseInt(limit), parseInt(offset)]);
    res.json({
      messages: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
};

exports.clearChatHistory = async (req, res) => {
  try {
    const userId = req.userId;

    const query = `
      DELETE FROM chat_history
      WHERE user_id = $1
    `;

    await pool.query(query, [userId]);
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
};

exports.sendContextualMessage = async (req, res) => {
  try {
    const { message, documentIds = [] } = req.body;
    const userId = req.userId;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // If specific documents provided, use them as context
    let context = '';
    if (documentIds.length > 0) {
      const docQuery = `
        SELECT title, content FROM documents
        WHERE id = ANY($1) AND user_id = $2
      `;
      const docResult = await pool.query(docQuery, [documentIds, userId]);
      
      context = docResult.rows.map(doc => 
        `[${doc.title}]\n${doc.content}`
      ).join('\n\n');
    }

    // Get RAG response with optional context
    let ragResult;
    if (context) {
      // Use provided documents as context
      const augmentedPrompt = `
Context from user documents:
${context}

User Question: ${message}

Please answer based on the provided document context.
      `;
      ragResult = {
        response: await chatService.sendMessage(message, augmentedPrompt),
        sourceDocuments: documentIds
      };
    } else {
      ragResult = await ragService.executeRAGPipeline(message);
    }

    // Save to chat history
    const saveQuery = `
      INSERT INTO chat_history (user_id, user_message, ai_response, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, created_at
    `;

    const saveResult = await pool.query(saveQuery, [
      userId,
      message,
      ragResult.response
    ]);

    res.json({
      message: ragResult.response,
      sources: ragResult.sourceDocuments,
      timestamp: saveResult.rows[0].created_at,
      chatId: saveResult.rows[0].id
    });
  } catch (error) {
    console.error('Send contextual message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
