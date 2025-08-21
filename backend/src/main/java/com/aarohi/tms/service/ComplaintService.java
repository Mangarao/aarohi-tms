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
     * Assign complaint to staff with schedule date
     */
    public Complaint assignComplaintWithSchedule(Long complaintId, Long staffId, LocalDateTime scheduleDate) {
        Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + complaintId));
        
        User staff = userRepository.findById(staffId)
            .orElseThrow(() -> new RuntimeException("Staff not found with id: " + staffId));
        
        if (staff.getRole() != Role.STAFF) {
            throw new RuntimeException("User is not a staff member");
        }
        
        complaint.setAssignedStaff(staff);
        complaint.setStatus(Status.ASSIGNED);
        complaint.setScheduledDate(scheduleDate);
        complaint.setUpdatedDate(LocalDateTime.now());
        
        return complaintRepository.save(complaint);
    }
    
    /**
     * Update schedule date for a complaint
     */
    public Complaint updateScheduleDate(Long complaintId, LocalDateTime scheduleDate) {
        Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + complaintId));
        
        complaint.setScheduledDate(scheduleDate);
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
    
    /**
     * Get staff schedule for a specific date
     */
    public List<Complaint> getStaffScheduleForDate(Long staffId, String date) {
        try {
            LocalDateTime startDate = LocalDateTime.parse(date + "T00:00:00");
            LocalDateTime endDate = LocalDateTime.parse(date + "T23:59:59");
            
            return complaintRepository.findByAssignedStaffIdAndScheduledDateBetween(
                staffId, startDate, endDate);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching staff schedule for date: " + e.getMessage());
        }
    }
    
    /**
     * Get all staff schedules for a date range
     */
    public List<Complaint> getAllStaffSchedules(String startDate, String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
            LocalDateTime end = LocalDateTime.parse(endDate + "T23:59:59");
            
            return complaintRepository.findByScheduledDateBetween(start, end);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching all staff schedules: " + e.getMessage());
        }
    }
    
    /**
     * Get weekly schedule summary
     */
    public Object getWeeklyScheduleSummary(String startDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
            LocalDateTime end = start.plusDays(7);
            
            List<Complaint> weeklyComplaints = complaintRepository.findByScheduledDateBetween(start, end);
            
            // Create summary object
            return new Object() {
                public final int totalScheduled = weeklyComplaints.size();
                public final long pending = weeklyComplaints.stream()
                    .filter(c -> c.getStatus() == Status.ASSIGNED)
                    .count();
                public final long inProgress = weeklyComplaints.stream()
                    .filter(c -> c.getStatus() == Status.IN_PROGRESS)
                    .count();
                public final long completed = weeklyComplaints.stream()
                    .filter(c -> c.getStatus() == Status.CLOSED)
                    .count();
            };
        } catch (Exception e) {
            throw new RuntimeException("Error fetching weekly schedule summary: " + e.getMessage());
        }
    }
    
    /**
     * Get complaints by schedule date range
     */
    public List<Complaint> getComplaintsByScheduleDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return complaintRepository.findByScheduledDateBetween(startDate, endDate);
    }
    
    /**
     * Get complaints by staff and schedule date range
     */
    public List<Complaint> getComplaintsByStaffAndScheduleDateRange(Long staffId, LocalDateTime startDate, LocalDateTime endDate) {
        return complaintRepository.findByAssignedStaffIdAndScheduledDateBetween(staffId, startDate, endDate);
    }
    
    /**
     * Get today's scheduled complaints
     */
    public List<Complaint> getTodaysScheduledComplaints() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);
        return complaintRepository.findByScheduledDateBetween(startOfDay, endOfDay);
    }
    
    /**
     * Get this week's scheduled complaints
     */
    public List<Complaint> getWeeklyScheduledComplaints() {
        LocalDateTime startOfWeek = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        // Adjust to start of current week (Monday)
        startOfWeek = startOfWeek.minusDays(startOfWeek.getDayOfWeek().getValue() - 1);
        LocalDateTime endOfWeek = startOfWeek.plusDays(7).minusNanos(1);
        return complaintRepository.findByScheduledDateBetween(startOfWeek, endOfWeek);
    }
    
    /**
     * Get staff schedule summary for date range
     */
    public Object getStaffScheduleSummary(LocalDateTime startDate, LocalDateTime endDate) {
        List<Complaint> complaints = complaintRepository.findByScheduledDateBetween(startDate, endDate);
        
        // Group by staff and create summary
        return complaints.stream()
            .filter(c -> c.getAssignedStaff() != null)
            .collect(java.util.stream.Collectors.groupingBy(
                c -> c.getAssignedStaff(),
                java.util.stream.Collectors.collectingAndThen(
                    java.util.stream.Collectors.toList(),
                    list -> new Object() {
                        public final String staffName = list.get(0).getAssignedStaff().getFullName();
                        public final Long staffId = list.get(0).getAssignedStaff().getId();
                        public final int totalScheduled = list.size();
                        public final long pending = list.stream()
                            .filter(c -> c.getStatus() == Status.ASSIGNED)
                            .count();
                        public final long inProgress = list.stream()
                            .filter(c -> c.getStatus() == Status.IN_PROGRESS)
                            .count();
                        public final long completed = list.stream()
                            .filter(c -> c.getStatus() == Status.CLOSED)
                            .count();
                    }
                )
            ));
    }
    
    /**
     * Check if a user can access a specific complaint
     * Used for authorization in @PreAuthorize annotations
     */
    public boolean canUserAccessComplaint(Long complaintId, Long userId) {
        Optional<Complaint> complaintOpt = getComplaintById(complaintId);
        if (complaintOpt.isEmpty()) {
            return false;
        }
        
        Complaint complaint = complaintOpt.get();
        return complaint.getAssignedStaff() != null && 
               complaint.getAssignedStaff().getId().equals(userId);
    }
}
