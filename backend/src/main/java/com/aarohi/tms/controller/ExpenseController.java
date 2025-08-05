package com.aarohi.tms.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aarohi.tms.dto.MessageResponse;
import com.aarohi.tms.entity.Expense;
import com.aarohi.tms.security.UserPrincipal;
import com.aarohi.tms.service.ExpenseService;

import jakarta.validation.Valid;

/**
 * REST Controller for expense management operations
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/expenses")
public class ExpenseController {
    
    @Autowired
    private ExpenseService expenseService;
    
    /**
     * Get all expenses (Admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Expense>> getAllExpenses() {
        List<Expense> expenses = expenseService.getAllExpenses();
        return ResponseEntity.ok(expenses);
    }
    
    /**
     * Get expense by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @expenseService.getExpenseById(#id).get().addedBy.id == authentication.principal.id")
    public ResponseEntity<?> getExpenseById(@PathVariable Long id) {
        return expenseService.getExpenseById(id)
                .map(expense -> ResponseEntity.ok().body(expense))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create new expense
     */
    @PostMapping("/complaint/{complaintId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> createExpense(@PathVariable Long complaintId, 
                                         @Valid @RequestBody Expense expense,
                                         Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            Expense createdExpense = expenseService.createExpense(complaintId, userPrincipal.getId(), expense);
            return ResponseEntity.ok(createdExpense);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error creating expense: " + e.getMessage()));
        }
    }
    
    /**
     * Update expense
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @expenseService.getExpenseById(#id).get().addedBy.id == authentication.principal.id")
    public ResponseEntity<?> updateExpense(@PathVariable Long id, @Valid @RequestBody Expense expenseDetails) {
        try {
            Expense updatedExpense = expenseService.updateExpense(id, expenseDetails);
            return ResponseEntity.ok(updatedExpense);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error updating expense: " + e.getMessage()));
        }
    }
    
    /**
     * Delete expense
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @expenseService.getExpenseById(#id).get().addedBy.id == authentication.principal.id")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id) {
        try {
            expenseService.deleteExpense(id);
            return ResponseEntity.ok(new MessageResponse("Expense deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get expenses by complaint ID
     */
    @GetMapping("/complaint/{complaintId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<List<Expense>> getExpensesByComplaintId(@PathVariable Long complaintId) {
        List<Expense> expenses = expenseService.getExpensesByComplaintId(complaintId);
        return ResponseEntity.ok(expenses);
    }
    
    /**
     * Get expenses added by current user
     */
    @GetMapping("/my-expenses")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<List<Expense>> getMyExpenses(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<Expense> expenses = expenseService.getExpensesByUser(userPrincipal.getId());
        return ResponseEntity.ok(expenses);
    }
    
    /**
     * Get expenses by user ID (Admin only)
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Expense>> getExpensesByUserId(@PathVariable Long userId) {
        List<Expense> expenses = expenseService.getExpensesByUser(userId);
        return ResponseEntity.ok(expenses);
    }
    
    /**
     * Get total expenses for a complaint
     */
    @GetMapping("/total/complaint/{complaintId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<BigDecimal> getTotalExpensesByComplaintId(@PathVariable Long complaintId) {
        BigDecimal totalExpenses = expenseService.getTotalExpensesByComplaintId(complaintId);
        return ResponseEntity.ok(totalExpenses);
    }
    
    /**
     * Get total expenses added by a user (Admin only)
     */
    @GetMapping("/total/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BigDecimal> getTotalExpensesByUserId(@PathVariable Long userId) {
        BigDecimal totalExpenses = expenseService.getTotalExpensesByUserId(userId);
        return ResponseEntity.ok(totalExpenses);
    }
    
    /**
     * Get recent expenses (Admin only)
     */
    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Expense>> getRecentExpenses() {
        List<Expense> expenses = expenseService.getRecentExpenses();
        return ResponseEntity.ok(expenses);
    }
    
    /**
     * Search expenses by description
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Expense>> searchExpensesByDescription(@RequestParam String description) {
        List<Expense> expenses = expenseService.searchExpensesByDescription(description);
        return ResponseEntity.ok(expenses);
    }
    
    /**
     * Get expenses by date range (Admin only)
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Expense>> getExpensesByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            List<Expense> expenses = expenseService.getExpensesByDateRange(start, end);
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get expenses by amount range (Admin only)
     */
    @GetMapping("/amount-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Expense>> getExpensesByAmountRange(
            @RequestParam BigDecimal minAmount,
            @RequestParam BigDecimal maxAmount) {
        List<Expense> expenses = expenseService.getExpensesByAmountRange(minAmount, maxAmount);
        return ResponseEntity.ok(expenses);
    }
    
    /**
     * Get expense statistics (Admin only)
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExpenseService.ExpenseStats> getExpenseStats() {
        ExpenseService.ExpenseStats stats = expenseService.getExpenseStats();
        return ResponseEntity.ok(stats);
    }
}
