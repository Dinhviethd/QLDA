const { ChatGroq } = require('@langchain/groq');
require('dotenv').config();

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  modelName: 'mixtral-8x7b-32768',
  temperature: 0.7,
  maxTokens: 2048,
});

module.exports = { model };
