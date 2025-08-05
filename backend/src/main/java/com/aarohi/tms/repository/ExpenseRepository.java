package com.aarohi.tms.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.aarohi.tms.entity.Complaint;
import com.aarohi.tms.entity.Expense;
import com.aarohi.tms.entity.User;

/**
 * Repository interface for Expense entity
 * Provides database operations for expense management
 */
@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    /**
     * Find expenses by complaint
     */
    List<Expense> findByComplaint(Complaint complaint);
    
    /**
     * Find expenses by complaint ID
     */
    List<Expense> findByComplaintId(Long complaintId);
    
    /**
     * Find expenses added by user
     */
    List<Expense> findByAddedBy(User addedBy);
    
    /**
     * Find expenses by date range
     */
    List<Expense> findByExpenseDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find expenses by amount range
     */
    List<Expense> findByAmountBetween(BigDecimal minAmount, BigDecimal maxAmount);
    
    /**
     * Calculate total expenses for a complaint
     */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.complaint.id = :complaintId")
    BigDecimal getTotalExpensesByComplaintId(@Param("complaintId") Long complaintId);
    
    /**
     * Calculate total expenses added by a user
     */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.addedBy.id = :userId")
    BigDecimal getTotalExpensesByUserId(@Param("userId") Long userId);
    
    /**
     * Find expenses by description containing text
     */
    List<Expense> findByDescriptionContainingIgnoreCase(String description);
    
    /**
     * Find recent expenses (last 30 days)
     */
    @Query("SELECT e FROM Expense e WHERE e.expenseDate >= :thirtyDaysAgo ORDER BY e.expenseDate DESC")
    List<Expense> findRecentExpenses(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);
    
    /**
     * Count expenses for a complaint
     */
    @Query("SELECT COUNT(e) FROM Expense e WHERE e.complaint.id = :complaintId")
    Long countByComplaintId(@Param("complaintId") Long complaintId);
}
