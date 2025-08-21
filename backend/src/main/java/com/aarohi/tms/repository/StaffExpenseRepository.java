package com.aarohi.tms.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.aarohi.tms.entity.StaffExpense;

/**
 * Repository interface for StaffExpense entity
 */
@Repository
public interface StaffExpenseRepository extends JpaRepository<StaffExpense, Long> {
    
    // Find all staff expenses by staff user ID
    List<StaffExpense> findByStaffUserIdOrderByCreatedAtDesc(Long staffUserId);
    
    // Find unpaid staff expenses by staff user ID
    List<StaffExpense> findByStaffUserIdAndIsPaidByCompanyFalseOrderByCreatedAtDesc(Long staffUserId);
    
    // Find paid staff expenses by staff user ID
    List<StaffExpense> findByStaffUserIdAndIsPaidByCompanyTrueOrderByPaidDateDesc(Long staffUserId);
    
    // Calculate total unpaid amount for a staff user
    @Query("SELECT COALESCE(SUM(se.amount), 0) FROM StaffExpense se WHERE se.staffUser.id = :staffUserId AND se.isPaidByCompany = false")
    BigDecimal getTotalUnpaidAmountByStaffUserId(@Param("staffUserId") Long staffUserId);
    
    // Calculate total paid amount for a staff user
    @Query("SELECT COALESCE(SUM(se.amount), 0) FROM StaffExpense se WHERE se.staffUser.id = :staffUserId AND se.isPaidByCompany = true")
    BigDecimal getTotalPaidAmountByStaffUserId(@Param("staffUserId") Long staffUserId);
    
    // Calculate total amount for a staff user
    @Query("SELECT COALESCE(SUM(se.amount), 0) FROM StaffExpense se WHERE se.staffUser.id = :staffUserId")
    BigDecimal getTotalAmountByStaffUserId(@Param("staffUserId") Long staffUserId);
    
    // Find all unpaid staff expenses (Admin view)
    List<StaffExpense> findByIsPaidByCompanyFalseOrderByCreatedAtDesc();
    
    // Find all staff expenses by date range
    List<StaffExpense> findByExpenseDateBetweenOrderByExpenseDateDesc(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find staff expenses by complaint number
    List<StaffExpense> findByComplaintNumberContainingIgnoreCaseOrderByCreatedAtDesc(String complaintNumber);
    
    // Count unpaid expenses for a staff user
    long countByStaffUserIdAndIsPaidByCompanyFalse(Long staffUserId);
    
    // Count paid expenses for a staff user
    long countByStaffUserIdAndIsPaidByCompanyTrue(Long staffUserId);
}
