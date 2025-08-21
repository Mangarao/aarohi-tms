package com.aarohi.tms.controller;

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
import com.aarohi.tms.dto.StaffExpenseRequestDTO;
import com.aarohi.tms.entity.ExpenseStatus;
import com.aarohi.tms.entity.StaffExpense;
import com.aarohi.tms.security.UserPrincipal;
import com.aarohi.tms.service.StaffExpenseService;

import jakarta.validation.Valid;

/**
 * REST Controller for staff expense management operations
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/staff-expenses")
public class StaffExpenseController {
    
    @Autowired
    private StaffExpenseService staffExpenseService;
    
    /**
     * Create new staff expense
     */
    @PostMapping
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<?> createStaffExpense(@Valid @RequestBody StaffExpenseRequestDTO expenseRequest,
                                              Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            
            // Create StaffExpense entity from DTO
            StaffExpense staffExpense = new StaffExpense();
            staffExpense.setAmount(expenseRequest.getAmount());
            staffExpense.setExpenseDate(expenseRequest.getParsedExpenseDate());
            staffExpense.setReason(expenseRequest.getReason());
            staffExpense.setComplaintNumber(expenseRequest.getComplaintNumber());
            
            // Set status if provided, default to PENDING
            if (expenseRequest.getStatus() != null && !expenseRequest.getStatus().isEmpty()) {
                try {
                    staffExpense.setStatus(ExpenseStatus.valueOf(expenseRequest.getStatus().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest()
                            .body(new MessageResponse("Invalid status: " + expenseRequest.getStatus()));
                }
            }
            
            StaffExpense createdExpense = staffExpenseService.createStaffExpense(userPrincipal.getId(), staffExpense);
            return ResponseEntity.ok(createdExpense);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error creating staff expense: " + e.getMessage()));
        }
    }
    
    /**
     * Update staff expense (only if not paid)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (@staffExpenseService.getStaffExpenseById(#id).isPresent() and @staffExpenseService.getStaffExpenseById(#id).get().staffUser.id == authentication.principal.id)")
    public ResponseEntity<?> updateStaffExpense(@PathVariable Long id, 
                                              @Valid @RequestBody StaffExpenseRequestDTO expenseRequest) {
        try {
            // Create StaffExpense entity from DTO
            StaffExpense expenseDetails = new StaffExpense();
            expenseDetails.setAmount(expenseRequest.getAmount());
            expenseDetails.setExpenseDate(expenseRequest.getParsedExpenseDate());
            expenseDetails.setReason(expenseRequest.getReason());
            expenseDetails.setComplaintNumber(expenseRequest.getComplaintNumber());
            
            // Set status if provided
            if (expenseRequest.getStatus() != null && !expenseRequest.getStatus().isEmpty()) {
                try {
                    expenseDetails.setStatus(ExpenseStatus.valueOf(expenseRequest.getStatus().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest()
                            .body(new MessageResponse("Invalid status: " + expenseRequest.getStatus()));
                }
            }
            
            StaffExpense updatedExpense = staffExpenseService.updateStaffExpense(id, expenseDetails);
            return ResponseEntity.ok(updatedExpense);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error updating staff expense: " + e.getMessage()));
        }
    }
    
    /**
     * Delete staff expense (only if not paid)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (@staffExpenseService.getStaffExpenseById(#id).isPresent() and @staffExpenseService.getStaffExpenseById(#id).get().staffUser.id == authentication.principal.id)")
    public ResponseEntity<?> deleteStaffExpense(@PathVariable Long id) {
        try {
            staffExpenseService.deleteStaffExpense(id);
            return ResponseEntity.ok(new MessageResponse("Staff expense deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    /**
     * Get staff expense by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (@staffExpenseService.getStaffExpenseById(#id).isPresent() and @staffExpenseService.getStaffExpenseById(#id).get().staffUser.id == authentication.principal.id)")
    public ResponseEntity<?> getStaffExpenseById(@PathVariable Long id) {
        return staffExpenseService.getStaffExpenseById(id)
                .map(expense -> ResponseEntity.ok().body(expense))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get my staff expenses
     */
    @GetMapping("/my-expenses")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<List<StaffExpense>> getMyStaffExpenses(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<StaffExpense> expenses = staffExpenseService.getStaffExpensesByUserId(userPrincipal.getId());
        return ResponseEntity.ok(expenses);
    }
    
    /**
     * Get my unpaid staff expenses
     */
    @GetMapping("/my-expenses/unpaid")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<List<StaffExpense>> getMyUnpaidStaffExpenses(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<StaffExpense> expenses = staffExpenseService.getUnpaidStaffExpensesByUserId(userPrincipal.getId());
        return ResponseEntity.ok(expenses);
    }
    
    /**
     * Get my paid staff expenses
     */
    @GetMapping("/my-expenses/paid")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<List<StaffExpense>> getMyPaidStaffExpenses(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<StaffExpense> expenses = staffExpenseService.getPaidStaffExpensesByUserId(userPrincipal.getId());
        return ResponseEntity.ok(expenses);
    }
    
    /**
     * Get my staff expense statistics
     */
    @GetMapping("/my-expenses/stats")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<StaffExpenseService.StaffExpenseStats> getMyStaffExpenseStats(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        StaffExpenseService.StaffExpenseStats stats = staffExpenseService.getStaffExpenseStats(userPrincipal.getId());
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Mark expense as paid by company (Admin only)
     */
    @PutMapping("/{id}/mark-paid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> markExpenseAsPaid(@PathVariable Long id) {
        try {
            StaffExpense updatedExpense = staffExpenseService.markAsPaidByCompany(id);
            return ResponseEntity.ok(updatedExpense);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    /**
     * Update expense status (Admin only)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateExpenseStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            ExpenseStatus expenseStatus = ExpenseStatus.valueOf(status.toUpperCase());
            StaffExpense updatedExpense = staffExpenseService.updateExpenseStatus(id, expenseStatus);
            return ResponseEntity.ok(updatedExpense);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Invalid status: " + status));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    /**
     * Get all unpaid staff expenses (Admin only)
     */
    @GetMapping("/unpaid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StaffExpense>> getAllUnpaidStaffExpenses() {
        List<StaffExpense> expenses = staffExpenseService.getAllUnpaidStaffExpenses();
        return ResponseEntity.ok(expenses);
    }
    
    /**
     * Get staff expenses by user ID (Admin only)
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StaffExpense>> getStaffExpensesByUserId(@PathVariable Long userId) {
        List<StaffExpense> expenses = staffExpenseService.getStaffExpensesByUserId(userId);
        return ResponseEntity.ok(expenses);
    }
    
    /**
     * Search staff expenses by complaint number
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<List<StaffExpense>> searchByComplaintNumber(@RequestParam String complaintNumber,
                                                                     Authentication authentication) {
        // Staff can only search their own expenses, Admin can search all
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<StaffExpense> expenses = staffExpenseService.searchByComplaintNumber(complaintNumber);
        
        // Filter by current user if not admin
        if (!userPrincipal.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))) {
            expenses = expenses.stream()
                    .filter(expense -> expense.getStaffUser().getId().equals(userPrincipal.getId()))
                    .toList();
        }
        
        return ResponseEntity.ok(expenses);
    }
    
    /**
     * Get staff expenses by date range
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<List<StaffExpense>> getStaffExpensesByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            Authentication authentication) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            List<StaffExpense> expenses = staffExpenseService.getStaffExpensesByDateRange(start, end);
            
            // Filter by current user if not admin
            if (!userPrincipal.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))) {
                expenses = expenses.stream()
                        .filter(expense -> expense.getStaffUser().getId().equals(userPrincipal.getId()))
                        .toList();
            }
            
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
