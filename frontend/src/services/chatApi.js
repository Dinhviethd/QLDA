import apiClient from './apiClient';

class ChatApi {
  async sendMessage(message, context = '') {
    return apiClient.post('/api/chat', { message, context });
  }

  async getChatHistory() {
    return apiClient.get('/api/chat/history');
  }

  async clearChatHistory() {
    return apiClient.delete('/api/chat/history');
  }
}

export default new ChatApi();
