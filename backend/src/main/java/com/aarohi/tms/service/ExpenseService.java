package com.aarohi.tms.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aarohi.tms.entity.Complaint;
import com.aarohi.tms.entity.Expense;
import com.aarohi.tms.entity.User;
import com.aarohi.tms.repository.ComplaintRepository;
import com.aarohi.tms.repository.ExpenseRepository;
import com.aarohi.tms.repository.UserRepository;

/**
 * Service class for Expense management operations
 */
@Service
@Transactional
public class ExpenseService {
    
    @Autowired
    private ExpenseRepository expenseRepository;
    
    @Autowired
    private ComplaintRepository complaintRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Create a new expense
     */
    public Expense createExpense(Expense expense) {
        expense.setExpenseDate(LocalDateTime.now());
        return expenseRepository.save(expense);
    }
    
    /**
     * Create expense with complaint and user IDs
     */
    public Expense createExpense(Long complaintId, Long userId, Expense expenseDetails) {
        Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + complaintId));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        Expense expense = new Expense();
        expense.setDescription(expenseDetails.getDescription());
        expense.setAmount(expenseDetails.getAmount());
        expense.setReceiptNumber(expenseDetails.getReceiptNumber());
        expense.setVendorName(expenseDetails.getVendorName());
        expense.setNotes(expenseDetails.getNotes());
        expense.setComplaint(complaint);
        expense.setAddedBy(user);
        expense.setExpenseDate(LocalDateTime.now());
        
        return expenseRepository.save(expense);
    }
    
    /**
     * Update expense
     */
    public Expense updateExpense(Long id, Expense expenseDetails) {
        Expense expense = expenseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));
        
        expense.setDescription(expenseDetails.getDescription());
        expense.setAmount(expenseDetails.getAmount());
        expense.setReceiptNumber(expenseDetails.getReceiptNumber());
        expense.setVendorName(expenseDetails.getVendorName());
        expense.setNotes(expenseDetails.getNotes());
        
        return expenseRepository.save(expense);
    }
    
    /**
     * Get expense by ID
     */
    public Optional<Expense> getExpenseById(Long id) {
        return expenseRepository.findById(id);
    }
    
    /**
     * Get all expenses
     */
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }
    
    /**
     * Get expenses by complaint ID
     */
    public List<Expense> getExpensesByComplaintId(Long complaintId) {
        return expenseRepository.findByComplaintId(complaintId);
    }
    
    /**
     * Get expenses by user (added by)
     */
    public List<Expense> getExpensesByUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return expenseRepository.findByAddedBy(user);
    }
    
    /**
     * Get total expenses for a complaint
     */
    public BigDecimal getTotalExpensesByComplaintId(Long complaintId) {
        return expenseRepository.getTotalExpensesByComplaintId(complaintId);
    }
    
    /**
     * Get total expenses added by a user
     */
    public BigDecimal getTotalExpensesByUserId(Long userId) {
        return expenseRepository.getTotalExpensesByUserId(userId);
    }
    
    /**
     * Get recent expenses
     */
    public List<Expense> getRecentExpenses() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return expenseRepository.findRecentExpenses(thirtyDaysAgo);
    }
    
    /**
     * Search expenses by description
     */
    public List<Expense> searchExpensesByDescription(String description) {
        return expenseRepository.findByDescriptionContainingIgnoreCase(description);
    }
    
    /**
     * Get expenses by date range
     */
    public List<Expense> getExpensesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return expenseRepository.findByExpenseDateBetween(startDate, endDate);
    }
    
    /**
     * Get expenses by amount range
     */
    public List<Expense> getExpensesByAmountRange(BigDecimal minAmount, BigDecimal maxAmount) {
        return expenseRepository.findByAmountBetween(minAmount, maxAmount);
    }
    
    /**
     * Delete expense
     */
    public void deleteExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));
        expenseRepository.delete(expense);
    }
    
    /**
     * Get expense statistics
     */
    public ExpenseStats getExpenseStats() {
        Long totalExpenses = expenseRepository.count();
        
        // Calculate total amount for all expenses
        List<Expense> allExpenses = expenseRepository.findAll();
        BigDecimal totalAmount = allExpenses.stream()
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Recent expenses (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Expense> recentExpenses = expenseRepository.findRecentExpenses(thirtyDaysAgo);
        Long recentExpensesCount = (long) recentExpenses.size();
        
        BigDecimal recentExpensesAmount = recentExpenses.stream()
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return new ExpenseStats(totalExpenses, totalAmount, recentExpensesCount, recentExpensesAmount);
    }
    
    /**
     * Expense statistics inner class
     */
    public static class ExpenseStats {
        private Long totalExpenses;
        private BigDecimal totalAmount;
        private Long recentExpensesCount;
        private BigDecimal recentExpensesAmount;
        
        public ExpenseStats(Long totalExpenses, BigDecimal totalAmount, 
                           Long recentExpensesCount, BigDecimal recentExpensesAmount) {
            this.totalExpenses = totalExpenses;
            this.totalAmount = totalAmount;
            this.recentExpensesCount = recentExpensesCount;
            this.recentExpensesAmount = recentExpensesAmount;
        }
        
        // Getters and Setters
        public Long getTotalExpenses() { return totalExpenses; }
        public void setTotalExpenses(Long totalExpenses) { this.totalExpenses = totalExpenses; }
        
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        
        public Long getRecentExpensesCount() { return recentExpensesCount; }
        public void setRecentExpensesCount(Long recentExpensesCount) { this.recentExpensesCount = recentExpensesCount; }
        
        public BigDecimal getRecentExpensesAmount() { return recentExpensesAmount; }
        public void setRecentExpensesAmount(BigDecimal recentExpensesAmount) { this.recentExpensesAmount = recentExpensesAmount; }
    }
}
