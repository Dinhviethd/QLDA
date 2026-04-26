import apiClient from './apiClient';

class AuthApi {
  async register(email, password, firstName, lastName, organization) {
    return apiClient.post('/api/auth/register', {
      email,
      password,
      firstName,
      lastName,
      organization
    });
  }

  async login(email, password) {
    return apiClient.post('/api/auth/login', {
      email,
      password
    });
  }

  async logout() {
    return apiClient.post('/api/auth/logout');
  }

  async checkAuth() {
    return apiClient.get('/api/auth/check');
  }
}

export default new AuthApi();
