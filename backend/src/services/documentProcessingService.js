const fs = require('fs').promises;
const path = require('path');
const pool = require('../config/database');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

/**
 * Document Processing Service
 * Handles document upload, storage, and processing
 */

exports.createUploadDirectory = async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
};

exports.saveDocument = async (file, userId, documentType = 'document') => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    const filename = `${Date.now()}_${file.originalname}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Save file to disk (in production, use cloud storage like S3)
    await fs.writeFile(filepath, file.buffer);

    // Save document metadata to database
    const query = `
      INSERT INTO documents (user_id, title, content, type, file_path, file_size, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, title, type, file_size, created_at
    `;

    const result = await pool.query(query, [
      userId,
      file.originalname,
      '', // content will be extracted from file in production
      documentType,
      filepath,
      file.size
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
};

exports.getDocumentsByUser = async (userId, limit = 10, offset = 0) => {
  try {
    const query = `
      SELECT id, title, type, file_size, created_at, updated_at
      FROM documents
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  } catch (error) {
    console.error('Error getting user documents:', error);
    throw error;
  }
};

exports.deleteDocument = async (documentId, userId) => {
  try {
    // Get document info
    const getQuery = `
      SELECT file_path FROM documents WHERE id = $1 AND user_id = $2
    `;
    const getResult = await pool.query(getQuery, [documentId, userId]);

    if (getResult.rows.length === 0) {
      throw new Error('Document not found or unauthorized');
    }

    const filePath = getResult.rows[0].file_path;

    // Delete from database
    const deleteQuery = `
      DELETE FROM documents WHERE id = $1 AND user_id = $2
    `;
    await pool.query(deleteQuery, [documentId, userId]);

    // Delete file from disk
    try {
      await fs.unlink(filePath);
    } catch (e) {
      console.warn('Error deleting file:', e);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

exports.processDocumentContent = async (documentId) => {
  try {
    // In production, extract text from PDF/Word docs
    // For now, this is a placeholder for document processing
    const query = `
      SELECT id, file_path FROM documents WHERE id = $1
    `;
    const result = await pool.query(query, [documentId]);

    if (result.rows.length === 0) {
      throw new Error('Document not found');
    }

    // Simulate content extraction
    // In production: use pdf-parse, mammoth, etc.
    const extractedContent = 'Document content would be extracted here';

    // Update document with extracted content
    const updateQuery = `
      UPDATE documents 
      SET content = $1, updated_at = NOW()
      WHERE id = $2
    `;
    await pool.query(updateQuery, [extractedContent, documentId]);

    return { success: true, extractedContent };
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
};

exports.searchDocuments = async (userId, searchTerm, limit = 10) => {
  try {
    const query = `
      SELECT id, title, type, created_at
      FROM documents
      WHERE user_id = $1 AND (
        title ILIKE $2 OR 
        content ILIKE $2
      )
      ORDER BY created_at DESC
      LIMIT $3
    `;

    const searchPattern = `%${searchTerm}%`;
    const result = await pool.query(query, [userId, searchPattern, limit]);
    return result.rows;
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
};
