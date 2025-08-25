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

  // Assign complaint to staff with schedule date
  async assignComplaintWithSchedule(complaintId, staffId, scheduleDate) {
    try {
      // Ensure the datetime has proper format
      let formattedDate = scheduleDate;
      if (scheduleDate && !scheduleDate.includes('T')) {
        // If only date is provided, add default time
        formattedDate = scheduleDate + 'T09:00:00';
      } else if (scheduleDate && scheduleDate.includes(':') && scheduleDate.split(':').length === 2) {
        // If datetime without seconds is provided, add seconds
        formattedDate = scheduleDate + ':00';
      }
      
      const response = await api.put(`/complaints/${complaintId}/assign/${staffId}/schedule`, null, {
        params: { scheduleDate: formattedDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Update schedule date for a complaint
  async updateScheduleDate(complaintId, scheduleDate) {
    try {
      // Ensure the datetime has proper format
      let formattedDate = scheduleDate;
      if (scheduleDate && !scheduleDate.includes('T')) {
        // If only date is provided, add default time
        formattedDate = scheduleDate + 'T09:00:00';
      } else if (scheduleDate && scheduleDate.includes(':') && scheduleDate.split(':').length === 2) {
        // If datetime without seconds is provided, add seconds
        formattedDate = scheduleDate + ':00';
      }
        
      const response = await api.put(`/complaints/${complaintId}/schedule`, null, {
        params: { scheduleDate: formattedDate }
      });
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
      
      const response = await api.post('/complaints/public', complaintData);
      
      console.log('Response status:', response.status);
      console.log('Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error submitting complaint:', error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      throw error.response?.data || error;
    }
  }

  // Check for existing complaint by mobile number
  async checkExistingComplaint(mobileNumber) {
    try {
      const response = await api.get(`/complaints/check-existing/${mobileNumber}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // No existing complaint
      }
      console.error('Error checking existing complaint:', error);
      return null; // Return null if there's any error
    }
  }

  // Get staff schedule for a specific date
  async getStaffScheduleForDate(staffId, date) {
    try {
      const response = await api.get(`/complaints/staff/${staffId}/schedule`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching schedule for staff ${staffId}:`, error);
      return []; // Return empty array on error
    }
  }

  // Get all staff schedules for a date range
  async getAllStaffSchedules(startDate, endDate) {
    try {
      const response = await api.get('/complaints/schedules', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all staff schedules:', error);
      return []; // Return empty array on error
    }
  }

  // Get complaints by schedule date range
  async getComplaintsByScheduleDateRange(startDate, endDate, staffId = null) {
    try {
      const params = { startDate, endDate };
      if (staffId) {
        params.staffId = staffId;
      }
      const response = await api.get('/complaints/schedule/date-range', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get today's scheduled complaints
  async getTodaysScheduledComplaints() {
    try {
      const response = await api.get('/complaints/schedule/today');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get this week's scheduled complaints
  async getWeeklyScheduledComplaints() {
    try {
      const response = await api.get('/complaints/schedule/week');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get staff schedule summary
  async getStaffScheduleSummary(startDate, endDate) {
    try {
      const response = await api.get('/complaints/schedule/staff-summary', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get weekly schedule summary
  async getWeeklyScheduleSummary(startDate) {
    try {
      const response = await api.get('/complaints/schedules/weekly', {
        params: { startDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

const complaintService = new ComplaintService();
export default complaintService;
