const axios = require('axios');
require('dotenv').config();

class ChatService {
  async sendMessage(userMessage, context = '') {
    try {
      const systemContext = context ? `Context: ${context}\n\n` : '';
      const fullMessage = `${systemContext}User: ${userMessage}`;

      // Using Gemini API directly
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
        {
          contents: [{
            parts: [{
              text: fullMessage
            }]
          }]
        },
        {
          params: {
            key: process.env.GEMINI_API_KEY
          }
        }
      );

      const aiResponse = response.data.candidates[0].content.parts[0].text;
      return aiResponse;
    } catch (error) {
      console.error('Error in ChatService:', error.message);
      throw new Error('Failed to process message');
    }
  }

  async generateResponse(prompt) {
    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          params: {
            key: process.env.GEMINI_API_KEY
          }
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error generating response:', error.message);
      throw new Error('Failed to generate response');
    }
  }
}

module.exports = new ChatService();
