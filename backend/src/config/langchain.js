const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
require('dotenv').config();

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: 'gemini-1.5-flash',
  temperature: 0.7,
  maxOutputTokens: 2048,
});

module.exports = { model };
