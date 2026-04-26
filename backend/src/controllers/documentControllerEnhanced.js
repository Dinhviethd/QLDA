const documentProcessingService = require('../services/documentProcessingService');

/**
 * Document Controller
 * Handles document upload, retrieval, and processing
 */

exports.uploadDocument = async (req, res) => {
  try {
    const userId = req.userId;
    const { documentType = 'document' } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Save document
    const document = await documentProcessingService.saveDocument(
      req.file,
      userId,
      documentType
    );

    // Process document content
    await documentProcessingService.processDocumentContent(document.id);

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 10, offset = 0 } = req.query;

    const documents = await documentProcessingService.getDocumentsByUser(
      userId,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      documents,
      total: documents.length
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const userId = req.userId;
    const { documentId } = req.params;

    await documentProcessingService.deleteDocument(documentId, userId);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(400).json({ error: error.message || 'Failed to delete document' });
  }
};

exports.searchDocuments = async (req, res) => {
  try {
    const userId = req.userId;
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const results = await documentProcessingService.searchDocuments(
      userId,
      q,
      parseInt(limit)
    );

    res.json({
      results,
      total: results.length,
      query: q
    });
  } catch (error) {
    console.error('Search documents error:', error);
    res.status(500).json({ error: 'Failed to search documents' });
  }
};

exports.processDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.userId;

    // Verify document belongs to user
    const query = `SELECT user_id FROM documents WHERE id = $1`;
    const result = await require('../config/database').query(query, [documentId]);

    if (result.rows.length === 0 || result.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const processResult = await documentProcessingService.processDocumentContent(documentId);

    res.json({
      message: 'Document processed successfully',
      result: processResult
    });
  } catch (error) {
    console.error('Process document error:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
};
