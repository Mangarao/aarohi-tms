import api from './api';

const API_URL = '/staff-expenses';

class StaffExpenseService {
  // Staff clears expense (marks as cleared)
  async clearExpense(id) {
    try {
      const response = await api.put(`${API_URL}/${id}/clear`);
      return response.data;
    } catch (error) {
      console.error('Error clearing expense:', error);
      throw error;
    }
  }
  // Create new staff expense
  async createStaffExpense(expenseData) {
    try {
      const response = await api.post(API_URL, expenseData);
      return response.data;
    } catch (error) {
      console.error('Error creating staff expense:', error);
      throw error;
    }
  }

  // Update staff expense (only if not paid)
  async updateStaffExpense(id, expenseData) {
    try {
      const response = await api.put(`${API_URL}/${id}`, expenseData);
      return response.data;
    } catch (error) {
      console.error('Error updating staff expense:', error);
      throw error;
    }
  }

  // Delete staff expense (only if not paid)
  async deleteStaffExpense(id) {
    try {
      const response = await api.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting staff expense:', error);
      throw error;
    }
  }

  // Get staff expense by ID
  async getStaffExpenseById(id) {
    try {
      const response = await api.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching staff expense:', error);
      throw error;
    }
  }

  // Get my staff expenses
  async getMyStaffExpenses() {
    try {
      const response = await api.get(`${API_URL}/my-expenses`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my staff expenses:', error);
      throw error;
    }
  }

  // Get my unpaid staff expenses
  async getMyUnpaidStaffExpenses() {
    try {
      const response = await api.get(`${API_URL}/my-expenses/unpaid`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my unpaid staff expenses:', error);
      throw error;
    }
  }

  // Get my paid staff expenses
  async getMyPaidStaffExpenses() {
    try {
      const response = await api.get(`${API_URL}/my-expenses/paid`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my paid staff expenses:', error);
      throw error;
    }
  }

  // Get my staff expense statistics
  async getMyStaffExpenseStats() {
    try {
      const response = await api.get(`${API_URL}/my-expenses/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my staff expense stats:', error);
      throw error;
    }
  }

  // Mark expense as paid by company (Admin only)
  async markExpenseAsPaid(id) {
    try {
      const response = await api.put(`${API_URL}/${id}/mark-paid`);
      return response.data;
    } catch (error) {
      console.error('Error marking expense as paid:', error);
      throw error;
    }
  }

  // Update expense status (Admin only)
  async updateExpenseStatus(id, status) {
    try {
      const response = await api.put(`${API_URL}/${id}/status`, null, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating expense status:', error);
      throw error;
    }
  }

  // Get all unpaid staff expenses (Admin only)
  async getAllUnpaidStaffExpenses() {
    try {
      const response = await api.get(`${API_URL}/unpaid`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all unpaid staff expenses:', error);
      throw error;
    }
  }

  // Search staff expenses by complaint number
  async searchByComplaintNumber(complaintNumber) {
    try {
      const response = await api.get(`${API_URL}/search`, {
        params: { complaintNumber }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching staff expenses:', error);
      throw error;
    }
  }

  // Get staff expenses by date range
  async getStaffExpensesByDateRange(startDate, endDate) {
    try {
      const response = await api.get(`${API_URL}/date-range`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching staff expenses by date range:', error);
      throw error;
    }
  }
}

const staffExpenseService = new StaffExpenseService();
export default staffExpenseService;
