package com.aarohi.tms.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aarohi.tms.entity.ExpenseStatus;
import com.aarohi.tms.entity.StaffExpense;
import com.aarohi.tms.entity.User;
import com.aarohi.tms.repository.StaffExpenseRepository;
import com.aarohi.tms.repository.UserRepository;

/**
 * Service class for StaffExpense management
 */
@Service
@Transactional
public class StaffExpenseService {
    
    @Autowired
    private StaffExpenseRepository staffExpenseRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Create a new staff expense
     */
    public StaffExpense createStaffExpense(Long staffUserId, StaffExpense staffExpense) {
        User staffUser = userRepository.findById(staffUserId)
                .orElseThrow(() -> new RuntimeException("Staff user not found with id: " + staffUserId));
        
        staffExpense.setStaffUser(staffUser);
        staffExpense.setCreatedAt(LocalDateTime.now());
        staffExpense.setUpdatedAt(LocalDateTime.now());
        
        return staffExpenseRepository.save(staffExpense);
    }
    
    /**
     * Update a staff expense (only if not paid)
     */
    public StaffExpense updateStaffExpense(Long expenseId, StaffExpense expenseDetails) {
        StaffExpense existingExpense = staffExpenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Staff expense not found with id: " + expenseId));
        
        // Check if expense is already paid - if so, don't allow editing
        if (Boolean.TRUE.equals(existingExpense.getIsPaidByCompany())) {
            throw new RuntimeException("Cannot edit expense that has already been paid by company");
        }
        
        existingExpense.setAmount(expenseDetails.getAmount());
        existingExpense.setReason(expenseDetails.getReason());
        existingExpense.setExpenseDate(expenseDetails.getExpenseDate());
        existingExpense.setComplaintNumber(expenseDetails.getComplaintNumber());
        existingExpense.setUpdatedAt(LocalDateTime.now());
        
        return staffExpenseRepository.save(existingExpense);
    }
    
    /**
     * Mark expense as paid by company (Admin only)
     */
    public StaffExpense markAsPaidByCompany(Long expenseId) {
        StaffExpense expense = staffExpenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Staff expense not found with id: " + expenseId));
        
        expense.setIsPaidByCompany(true);
        expense.setPaidDate(LocalDateTime.now());
        expense.setUpdatedAt(LocalDateTime.now());
        
        return staffExpenseRepository.save(expense);
    }
    
    /**
     * Update expense status (Admin only)
     */
    public StaffExpense updateExpenseStatus(Long expenseId, ExpenseStatus status) {
        StaffExpense expense = staffExpenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Staff expense not found with id: " + expenseId));
        
        expense.setStatus(status);
        
        // If status is set to PAID, also mark as paid by company
        if (status == ExpenseStatus.PAID) {
            expense.setIsPaidByCompany(true);
            expense.setPaidDate(LocalDateTime.now());
        }
        
        expense.setUpdatedAt(LocalDateTime.now());
        
        return staffExpenseRepository.save(expense);
    }
    
    /**
     * Delete a staff expense (only if not paid)
     */
    public void deleteStaffExpense(Long expenseId) {
        StaffExpense expense = staffExpenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Staff expense not found with id: " + expenseId));
        
        // Check if expense is already paid - if so, don't allow deletion
        if (Boolean.TRUE.equals(expense.getIsPaidByCompany())) {
            throw new RuntimeException("Cannot delete expense that has already been paid by company");
        }
        
        staffExpenseRepository.delete(expense);
    }
    
    /**
     * Get staff expense by ID
     */
    public Optional<StaffExpense> getStaffExpenseById(Long expenseId) {
        return staffExpenseRepository.findById(expenseId);
    }
    
    /**
     * Get all staff expenses for a specific staff user
     */
    public List<StaffExpense> getStaffExpensesByUserId(Long staffUserId) {
        return staffExpenseRepository.findByStaffUserIdOrderByCreatedAtDesc(staffUserId);
    }
    
    /**
     * Get unpaid staff expenses for a specific staff user
     */
    public List<StaffExpense> getUnpaidStaffExpensesByUserId(Long staffUserId) {
        return staffExpenseRepository.findByStaffUserIdAndIsPaidByCompanyFalseOrderByCreatedAtDesc(staffUserId);
    }
    
    /**
     * Get paid staff expenses for a specific staff user
     */
    public List<StaffExpense> getPaidStaffExpensesByUserId(Long staffUserId) {
        return staffExpenseRepository.findByStaffUserIdAndIsPaidByCompanyTrueOrderByPaidDateDesc(staffUserId);
    }
    
    /**
     * Get all unpaid staff expenses (Admin view)
     */
    public List<StaffExpense> getAllUnpaidStaffExpenses() {
        return staffExpenseRepository.findByIsPaidByCompanyFalseOrderByCreatedAtDesc();
    }
    
    /**
     * Get expense statistics for a staff user
     */
    public StaffExpenseStats getStaffExpenseStats(Long staffUserId) {
        BigDecimal totalAmount = staffExpenseRepository.getTotalAmountByStaffUserId(staffUserId);
        BigDecimal totalUnpaidAmount = staffExpenseRepository.getTotalUnpaidAmountByStaffUserId(staffUserId);
        BigDecimal totalPaidAmount = staffExpenseRepository.getTotalPaidAmountByStaffUserId(staffUserId);
        long unpaidCount = staffExpenseRepository.countByStaffUserIdAndIsPaidByCompanyFalse(staffUserId);
        long paidCount = staffExpenseRepository.countByStaffUserIdAndIsPaidByCompanyTrue(staffUserId);
        
        return new StaffExpenseStats(totalAmount, totalUnpaidAmount, totalPaidAmount, unpaidCount, paidCount);
    }
    
    /**
     * Search staff expenses by complaint number
     */
    public List<StaffExpense> searchByComplaintNumber(String complaintNumber) {
        return staffExpenseRepository.findByComplaintNumberContainingIgnoreCaseOrderByCreatedAtDesc(complaintNumber);
    }
    
    /**
     * Get staff expenses by date range
     */
    public List<StaffExpense> getStaffExpensesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return staffExpenseRepository.findByExpenseDateBetweenOrderByExpenseDateDesc(startDate, endDate);
    }
    
    /**
     * Stats class for staff expenses
     */
    public static class StaffExpenseStats {
        private BigDecimal totalAmount;
        private BigDecimal totalUnpaidAmount;
        private BigDecimal totalPaidAmount;
        private long unpaidCount;
        private long paidCount;
        
        public StaffExpenseStats(BigDecimal totalAmount, BigDecimal totalUnpaidAmount, 
                               BigDecimal totalPaidAmount, long unpaidCount, long paidCount) {
            this.totalAmount = totalAmount != null ? totalAmount : BigDecimal.ZERO;
            this.totalUnpaidAmount = totalUnpaidAmount != null ? totalUnpaidAmount : BigDecimal.ZERO;
            this.totalPaidAmount = totalPaidAmount != null ? totalPaidAmount : BigDecimal.ZERO;
            this.unpaidCount = unpaidCount;
            this.paidCount = paidCount;
        }
        
        // Getters
        public BigDecimal getTotalAmount() { return totalAmount; }
        public BigDecimal getTotalUnpaidAmount() { return totalUnpaidAmount; }
        public BigDecimal getTotalPaidAmount() { return totalPaidAmount; }
        public long getUnpaidCount() { return unpaidCount; }
        public long getPaidCount() { return paidCount; }
        public long getTotalCount() { return unpaidCount + paidCount; }
    }
}
