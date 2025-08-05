import api from './api';

/**
 * Authentication service for login, logout, and user management
 */
class AuthService {
  // User login
  async login(username, password, role = 'ADMIN') {
    try {
      const response = await api.post('/auth/signin', {
        username,
        password,
        role,
      });
      
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // User logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // User registration
  async register(userData) {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Check if user is logged in
  isLoggedIn() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Check if user is admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'ROLE_ADMIN';
  }

  // Check if user is staff
  isStaff() {
    const user = this.getCurrentUser();
    return user && user.role === 'ROLE_STAFF';
  }

  // Get user profile
  async getUserProfile() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

const authService = new AuthService();
export default authService;
