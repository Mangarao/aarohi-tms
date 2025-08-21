package com.aarohi.tms.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.aarohi.tms.entity.Complaint;
import com.aarohi.tms.entity.ComplaintType;
import com.aarohi.tms.entity.Priority;
import com.aarohi.tms.entity.Status;
import com.aarohi.tms.entity.User;

/**
 * Repository interface for Complaint entity
 * Provides database operations for complaint management
 */
@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    
    /**
     * Find complaints by mobile number
     */
    List<Complaint> findByMobileNumber(String mobileNumber);
    
    /**
     * Find complaints by status
     */
    List<Complaint> findByStatus(Status status);
    
    /**
     * Find complaints by priority
     */
    List<Complaint> findByPriority(Priority priority);
    
    /**
     * Find complaints by type
     */
    List<Complaint> findByComplaintType(ComplaintType complaintType);
    
    /**
     * Find complaints by assigned staff
     */
    List<Complaint> findByAssignedStaff(User assignedStaff);
    
    /**
     * Find complaints by assigned staff ID
     */
    List<Complaint> findByAssignedStaffId(Long assignedStaffId);
    
    /**
     * Find complaints under warranty
     */
    List<Complaint> findByUnderWarranty(Boolean underWarranty);
    
    /**
     * Find complaints by city
     */
    List<Complaint> findByCity(String city);
    
    /**
     * Find complaints by state
     */
    List<Complaint> findByState(String state);
    
    /**
     * Find complaints created between dates
     */
    List<Complaint> findByCreatedDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find complaints by customer name containing text (case insensitive)
     */
    List<Complaint> findByCustomerNameContainingIgnoreCase(String customerName);
    
    /**
     * Count complaints by status
     */
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = :status")
    Long countByStatus(@Param("status") Status status);
    
    /**
     * Count complaints by priority
     */
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.priority = :priority")
    Long countByPriority(@Param("priority") Priority priority);
    
    /**
     * Count complaints assigned to staff
     */
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.assignedStaff.id = :staffId")
    Long countByAssignedStaffId(@Param("staffId") Long staffId);
    
    /**
     * Find recent complaints (last 30 days)
     */
    @Query("SELECT c FROM Complaint c WHERE c.createdDate >= :thirtyDaysAgo ORDER BY c.createdDate DESC")
    List<Complaint> findRecentComplaints(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);
    
    /**
     * Find high priority open complaints
     */
    @Query("SELECT c FROM Complaint c WHERE c.priority = 'HIGH' AND c.status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS') ORDER BY c.createdDate ASC")
    List<Complaint> findHighPriorityOpenComplaints();
    
    /**
     * Search complaints by multiple criteria
     */
    @Query("SELECT c FROM Complaint c WHERE " +
           "(:customerName IS NULL OR LOWER(c.customerName) LIKE LOWER(CONCAT('%', :customerName, '%'))) AND " +
           "(:mobileNumber IS NULL OR c.mobileNumber LIKE CONCAT('%', :mobileNumber, '%')) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:priority IS NULL OR c.priority = :priority) AND " +
           "(:complaintType IS NULL OR c.complaintType = :complaintType) AND " +
           "(:assignedStaffId IS NULL OR c.assignedStaff.id = :assignedStaffId)")
    List<Complaint> searchComplaints(
            @Param("customerName") String customerName,
            @Param("mobileNumber") String mobileNumber,
            @Param("status") Status status,
            @Param("priority") Priority priority,
            @Param("complaintType") ComplaintType complaintType,
            @Param("assignedStaffId") Long assignedStaffId
    );
    
    /**
     * Find complaints by mobile number excluding specific status
     */
    List<Complaint> findByMobileNumberAndStatusNot(String mobileNumber, Status status);
    
    /**
     * Find complaints by assigned staff and schedule date range
     */
    List<Complaint> findByAssignedStaffIdAndScheduledDateBetween(Long assignedStaffId, LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find complaints by schedule date range
     */
    List<Complaint> findByScheduledDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find scheduled complaints for a specific staff member
     */
    @Query("SELECT c FROM Complaint c WHERE c.assignedStaff.id = :staffId AND c.scheduledDate IS NOT NULL ORDER BY c.scheduledDate ASC")
    List<Complaint> findScheduledComplaintsByStaffId(@Param("staffId") Long staffId);
}
