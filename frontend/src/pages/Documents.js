import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/documents`);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="app-container">
      <Header />
      <div className="app-main">
        <aside className="app-sidebar">
          <div className="sidebar-section">
            <h3>Document Actions</h3>
            <ul>
              <li><a href="/">← Back to Dashboard</a></li>
              <li><a href="/chat">💬 Chat</a></li>
            </ul>
          </div>
          <div className="sidebar-section">
            <h4>Supported Formats</h4>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              PDF, TXT, DOCX, XLSX
            </p>
          </div>
        </aside>
        <div className="app-content">
          <div className="dashboard-header">
            <h2>📄 Your Documents</h2>
            <p>Upload and manage documents for AI analysis</p>
          </div>

          <div className="dashboard-sections">
            <section className="dashboard-section">
              <h3>Upload New Document</h3>
              <div style={{
                border: '2px dashed #667eea',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
              }}>
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                  <p>📁 Click to upload or drag and drop</p>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>PDF, TXT, DOCX, XLSX (max 10MB)</p>
                </label>
                {uploading && <p>Uploading...</p>}
              </div>
              {error && <p style={{ color: '#e74c3c', marginTop: '1rem' }}>{error}</p>}
            </section>

            <section className="dashboard-section">
              <h3>Document List ({documents.length})</h3>
              {loading ? (
                <p>Loading documents...</p>
              ) : documents.length === 0 ? (
                <p>No documents yet. Upload your first document to get started!</p>
              ) : (
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginTop: '1rem',
                }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem', color: '#333' }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', color: '#333' }}>Size</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', color: '#333' }}>Uploaded</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', color: '#333' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '0.75rem' }}>📄 {doc.name || 'Untitled'}</td>
                        <td style={{ padding: '0.75rem' }}>{doc.size || 'N/A'}</td>
                        <td style={{ padding: '0.75rem' }}>{doc.uploadedAt || 'N/A'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <button style={{
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Documents;
