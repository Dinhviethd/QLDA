const pool = require('../config/database');

exports.getDocuments = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      'SELECT id, title, document_type, created_at FROM documents WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      documents: result.rows
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const { title, content, documentType } = req.body;
    const userId = req.userId;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const result = await pool.query(
      'INSERT INTO documents (user_id, title, content, document_type) VALUES ($1, $2, $3, $4) RETURNING id, title, document_type, created_at',
      [userId, title, content, documentType || null]
    );

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: result.rows[0]
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Soft delete
    const result = await pool.query(
      'UPDATE documents SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};
