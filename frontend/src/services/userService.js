import api from './api';

/**
 * User service for user management operations
 */
class UserService {
  // Get all users
  async getAllUsers() {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get user by ID
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Update user
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Delete user
  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get active staff members
  async getActiveStaffMembers() {
    try {
      const response = await api.get('/users/staff/active');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get all staff members (active and inactive)
  async getAllStaff() {
    try {
      const response = await api.get('/users/staff');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Activate user
  async activateUser(id) {
    try {
      const response = await api.put(`/users/${id}/activate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Deactivate user
  async deactivateUser(id) {
    try {
      const response = await api.put(`/users/${id}/deactivate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

const userService = new UserService();
export default userService;
