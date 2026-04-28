const axios = require('axios');
require('dotenv').config();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

class ChatService {
  async sendMessage(userMessage, context = '') {
    try {
      const systemContext = context ? `Context: ${context}\n\n` : '';
      const fullMessage = `${systemContext}${userMessage}`;

      // Using Groq API directly
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant for eOffice.'
            },
            {
              role: 'user',
              content: fullMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 2048
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      return aiResponse;
    } catch (error) {
      console.error('Error in ChatService:', error.message);
      throw new Error('Failed to process message');
    }
  }

  async generateResponse(prompt) {
    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant for eOffice.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2048
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating response:', error.message);
      throw new Error('Failed to generate response');
    }
  }
}

module.exports = new ChatService();
