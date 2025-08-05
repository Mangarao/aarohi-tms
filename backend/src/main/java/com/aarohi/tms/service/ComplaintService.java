package com.aarohi.tms.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aarohi.tms.entity.Complaint;
import com.aarohi.tms.entity.ComplaintType;
import com.aarohi.tms.entity.Priority;
import com.aarohi.tms.entity.Role;
import com.aarohi.tms.entity.Status;
import com.aarohi.tms.entity.User;
import com.aarohi.tms.repository.ComplaintRepository;
import com.aarohi.tms.repository.UserRepository;

/**
 * Service class for Complaint management operations
 */
@Service
@Transactional
public class ComplaintService {
    
    @Autowired
    private ComplaintRepository complaintRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Create a new complaint
     */
    public Complaint createComplaint(Complaint complaint) {
        complaint.setCreatedDate(LocalDateTime.now());
        complaint.setUpdatedDate(LocalDateTime.now());
        return complaintRepository.save(complaint);
    }
    
    /**
     * Update complaint
     */
    public Complaint updateComplaint(Long id, Complaint complaintDetails) {
        Complaint complaint = complaintRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));
        
        // Update fields
        complaint.setCustomerName(complaintDetails.getCustomerName());
        complaint.setMobileNumber(complaintDetails.getMobileNumber());
        complaint.setEmail(complaintDetails.getEmail());
        complaint.setAddress(complaintDetails.getAddress());
        complaint.setCity(complaintDetails.getCity());
        complaint.setState(complaintDetails.getState());
        complaint.setMachineNameModel(complaintDetails.getMachineNameModel());
        complaint.setProblemDescription(complaintDetails.getProblemDescription());
        complaint.setUnderWarranty(complaintDetails.getUnderWarranty());
        complaint.setMachinePurchaseDate(complaintDetails.getMachinePurchaseDate());
        complaint.setComplaintType(complaintDetails.getComplaintType());
        complaint.setStatus(complaintDetails.getStatus());
        complaint.setPriority(complaintDetails.getPriority());
        complaint.setResolutionNotes(complaintDetails.getResolutionNotes());
        complaint.setUpdatedDate(LocalDateTime.now());
        
        return complaintRepository.save(complaint);
    }
    
    /**
     * Assign complaint to staff
     */
    public Complaint assignComplaint(Long complaintId, Long staffId) {
        Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + complaintId));
        
        User staff = userRepository.findById(staffId)
            .orElseThrow(() -> new RuntimeException("Staff not found with id: " + staffId));
        
        if (staff.getRole() != Role.STAFF) {
            throw new RuntimeException("User is not a staff member");
        }
        
        complaint.setAssignedStaff(staff);
        complaint.setStatus(Status.ASSIGNED);
        complaint.setUpdatedDate(LocalDateTime.now());
        
        return complaintRepository.save(complaint);
    }
    
    /**
     * Update complaint status
     */
    public Complaint updateComplaintStatus(Long id, Status status, String resolutionNotes) {
        Complaint complaint = complaintRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));
        
        complaint.setStatus(status);
        if (resolutionNotes != null && !resolutionNotes.isEmpty()) {
            complaint.setResolutionNotes(resolutionNotes);
        }
        complaint.setUpdatedDate(LocalDateTime.now());
        
        return complaintRepository.save(complaint);
    }
    
    /**
     * Get complaint by ID
     */
    public Optional<Complaint> getComplaintById(Long id) {
        return complaintRepository.findById(id);
    }
    
    /**
     * Get all complaints
     */
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }
    
    /**
     * Get complaints by status
     */
    public List<Complaint> getComplaintsByStatus(Status status) {
        return complaintRepository.findByStatus(status);
    }
    
    /**
     * Get complaints by priority
     */
    public List<Complaint> getComplaintsByPriority(Priority priority) {
        return complaintRepository.findByPriority(priority);
    }
    
    /**
     * Get complaints by assigned staff
     */
    public List<Complaint> getComplaintsByAssignedStaff(Long staffId) {
        return complaintRepository.findByAssignedStaffId(staffId);
    }
    
    /**
     * Get complaints by mobile number
     */
    public List<Complaint> getComplaintsByMobileNumber(String mobileNumber) {
        return complaintRepository.findByMobileNumber(mobileNumber);
    }
    
    /**
     * Search complaints with filters
     */
    public List<Complaint> searchComplaints(String customerName, String mobileNumber, 
                                          Status status, Priority priority, 
                                          ComplaintType complaintType, Long assignedStaffId) {
        return complaintRepository.searchComplaints(customerName, mobileNumber, 
                                                   status, priority, complaintType, assignedStaffId);
    }
    
    /**
     * Get recent complaints
     */
    public List<Complaint> getRecentComplaints() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return complaintRepository.findRecentComplaints(thirtyDaysAgo);
    }
    
    /**
     * Get high priority open complaints
     */
    public List<Complaint> getHighPriorityOpenComplaints() {
        return complaintRepository.findHighPriorityOpenComplaints();
    }
    
    /**
     * Delete complaint
     */
    public void deleteComplaint(Long id) {
        Complaint complaint = complaintRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));
        complaintRepository.delete(complaint);
    }
    
    /**
     * Get complaint statistics
     */
    public ComplaintStats getComplaintStats() {
        Long totalComplaints = complaintRepository.count();
        Long openComplaints = complaintRepository.countByStatus(Status.OPEN);
        Long assignedComplaints = complaintRepository.countByStatus(Status.ASSIGNED);
        Long inProgressComplaints = complaintRepository.countByStatus(Status.IN_PROGRESS);
        Long closedComplaints = complaintRepository.countByStatus(Status.CLOSED);
        Long highPriorityComplaints = complaintRepository.countByPriority(Priority.HIGH);
        
        return new ComplaintStats(totalComplaints, openComplaints, assignedComplaints, 
                                 inProgressComplaints, closedComplaints, highPriorityComplaints);
    }
    
    /**
     * Complaint statistics inner class
     */
    public static class ComplaintStats {
        private Long totalComplaints;
        private Long openComplaints;
        private Long assignedComplaints;
        private Long inProgressComplaints;
        private Long closedComplaints;
        private Long highPriorityComplaints;
        
        public ComplaintStats(Long totalComplaints, Long openComplaints, Long assignedComplaints,
                             Long inProgressComplaints, Long closedComplaints, Long highPriorityComplaints) {
            this.totalComplaints = totalComplaints;
            this.openComplaints = openComplaints;
            this.assignedComplaints = assignedComplaints;
            this.inProgressComplaints = inProgressComplaints;
            this.closedComplaints = closedComplaints;
            this.highPriorityComplaints = highPriorityComplaints;
        }
        
        // Getters and Setters
        public Long getTotalComplaints() { return totalComplaints; }
        public void setTotalComplaints(Long totalComplaints) { this.totalComplaints = totalComplaints; }
        
        public Long getOpenComplaints() { return openComplaints; }
        public void setOpenComplaints(Long openComplaints) { this.openComplaints = openComplaints; }
        
        public Long getAssignedComplaints() { return assignedComplaints; }
        public void setAssignedComplaints(Long assignedComplaints) { this.assignedComplaints = assignedComplaints; }
        
        public Long getInProgressComplaints() { return inProgressComplaints; }
        public void setInProgressComplaints(Long inProgressComplaints) { this.inProgressComplaints = inProgressComplaints; }
        
        public Long getClosedComplaints() { return closedComplaints; }
        public void setClosedComplaints(Long closedComplaints) { this.closedComplaints = closedComplaints; }
        
        public Long getHighPriorityComplaints() { return highPriorityComplaints; }
        public void setHighPriorityComplaints(Long highPriorityComplaints) { this.highPriorityComplaints = highPriorityComplaints; }
    }
    
    /**
     * Get complaints by mobile number with active status (not closed)
     */
    public List<Complaint> getComplaintsByMobileAndActiveStatus(String mobileNumber) {
        return complaintRepository.findByMobileNumberAndStatusNot(mobileNumber, Status.CLOSED);
    }
}
