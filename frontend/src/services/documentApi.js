import apiClient from './apiClient';

class DocumentApi {
  async getDocuments() {
    return apiClient.get('/api/documents');
  }

  async uploadDocument(title, content, documentType) {
    return apiClient.post('/api/documents', {
      title,
      content,
      documentType
    });
  }

  async deleteDocument(id) {
    return apiClient.delete(`/api/documents/${id}`);
  }
}

export default new DocumentApi();
