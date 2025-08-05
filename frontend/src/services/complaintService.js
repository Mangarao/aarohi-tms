import api from './api';

/**
 * Complaint service for CRUD operations
 */
class ComplaintService {
  // Get all complaints (Admin only)
  async getAllComplaints() {
    try {
      const response = await api.get('/complaints');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get complaint by ID
  async getComplaintById(id) {
    try {
      const response = await api.get(`/complaints/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Create new complaint
  async createComplaint(complaintData) {
    try {
      const response = await api.post('/complaints', complaintData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Update complaint
  async updateComplaint(id, complaintData) {
    try {
      const response = await api.put(`/complaints/${id}`, complaintData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Delete complaint
  async deleteComplaint(id) {
    try {
      const response = await api.delete(`/complaints/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Assign complaint to staff
  async assignComplaint(complaintId, staffId) {
    try {
      const response = await api.put(`/complaints/${complaintId}/assign/${staffId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Update complaint status
  async updateComplaintStatus(id, status, resolutionNotes = '') {
    try {
      const response = await api.put(`/complaints/${id}/status`, null, {
        params: { status, resolutionNotes }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get complaints by status
  async getComplaintsByStatus(status) {
    try {
      const response = await api.get(`/complaints/status/${status}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get complaints assigned to current staff
  async getMyAssignedComplaints() {
    try {
      const response = await api.get('/complaints/my-assignments');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Search complaints
  async searchComplaints(filters) {
    try {
      const response = await api.get('/complaints/search', {
        params: filters
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get complaint statistics
  async getComplaintStats() {
    try {
      const response = await api.get('/complaints/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get recent complaints
  async getRecentComplaints() {
    try {
      const response = await api.get('/complaints/recent');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get high priority complaints
  async getHighPriorityComplaints() {
    try {
      const response = await api.get('/complaints/high-priority');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Create public complaint (no authentication required)
  async createPublicComplaint(complaintData) {
    try {
      console.log('Submitting complaint:', complaintData);
      
      const response = await fetch('http://localhost:8080/api/complaints/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(complaintData)
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Failed to submit complaint';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('Success:', result);
      return result;
    } catch (error) {
      console.error('Error submitting complaint:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check if the backend is running on port 8080.');
      }
      throw error;
    }
  }

  // Check for existing complaint by mobile number
  async checkExistingComplaint(mobileNumber) {
    try {
      const response = await fetch(`http://localhost:8080/api/complaints/check-existing/${mobileNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.status === 404) {
        return null; // No existing complaint
      }
      
      if (!response.ok) {
        throw new Error('Failed to check existing complaint');
      }
      
      return await response.json();
    } catch (error) {
      return null; // Return null if there's any error
    }
  }
}

const complaintService = new ComplaintService();
export default complaintService;
