const axios = require('axios');
const pool = require('../config/database');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * RAG Pipeline Service
 * Implements Retrieval-Augmented Generation using Groq API
 * Retrieves relevant document embeddings and augments user queries
 */

exports.retrieveRelevantDocuments = async (queryEmbedding, limit = 5) => {
  try {
    // Query similar documents using vector similarity
    // Note: Requires pgvector extension to be installed
    const query = `
      SELECT 
        d.id,
        d.title,
        d.content,
        d.type,
        de.embedding,
        1 - (de.embedding <-> $1::vector) as similarity
      FROM document_embeddings de
      JOIN documents d ON de.document_id = d.id
      ORDER BY de.embedding <-> $1::vector
      LIMIT $2
    `;
    
    const result = await pool.query(query, [queryEmbedding, limit]);
    return result.rows;
  } catch (error) {
    console.error('Error retrieving documents:', error);
    throw error;
  }
};

exports.generateQueryEmbedding = async (query) => {
  try {
    // In production, use sentence-transformers or similar
    // For now, return a placeholder vector (512 dimensions)
    // This should be replaced with actual embedding generation
    const embeddingVector = Array(512).fill(0.1);
    return embeddingVector;
  } catch (error) {
    console.error('Error generating query embedding:', error);
    throw error;
  }
};

exports.augmentQueryWithContext = async (userQuery, relevantDocuments) => {
  try {
    // Build context from relevant documents
    let context = 'Relevant document context:\n\n';
    
    relevantDocuments.forEach((doc, index) => {
      context += `[Document ${index + 1}]: ${doc.title}\n`;
      context += `Type: ${doc.type}\n`;
      context += `Content: ${doc.content.substring(0, 500)}...\n\n`;
    });
    
    return context;
  } catch (error) {
    console.error('Error augmenting query:', error);
    throw error;
  }
};

exports.generateRAGResponse = async (userQuery, documentContext) => {
  try {
    const augmentedPrompt = `
You are an AI assistant for an eOffice system. Use the provided document context to answer the user's question accurately and professionally.

Document Context:
${documentContext}

User Query: ${userQuery}

Please provide a helpful, accurate response based on the document context above. If the documents don't contain relevant information, say so clearly.
    `;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for eOffice that uses document context to answer questions.'
          },
          {
            role: 'user',
            content: augmentedPrompt
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

    if (response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    }

    throw new Error('No response from Groq API');
  } catch (error) {
    console.error('Error generating RAG response:', error);
    throw error;
  }
};

exports.executeRAGPipeline = async (userQuery, documentIds = null) => {
  try {
    // Step 1: Generate embedding for user query
    const queryEmbedding = await exports.generateQueryEmbedding(userQuery);

    // Step 2: Retrieve relevant documents
    const relevantDocuments = await exports.retrieveRelevantDocuments(queryEmbedding, 5);

    if (relevantDocuments.length === 0) {
      // If no documents found, use query directly
      return await exports.generateRAGResponse(userQuery, 'No relevant documents found in knowledge base.');
    }

    // Step 3: Augment query with document context
    const documentContext = await exports.augmentQueryWithContext(userQuery, relevantDocuments);

    // Step 4: Generate response using augmented context
    const response = await exports.generateRAGResponse(userQuery, documentContext);

    return {
      response,
      sourceDocuments: relevantDocuments.map(doc => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        similarity: doc.similarity
      }))
    };
  } catch (error) {
    console.error('Error executing RAG pipeline:', error);
    throw error;
  }
};
