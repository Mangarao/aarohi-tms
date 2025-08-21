package com.aarohi.tms.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for creating/updating staff expenses
 */
public class StaffExpenseRequestDTO {
    
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal amount;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private String expenseDate; // Accept as String first, then convert
    
    @NotBlank
    private String reason;
    
    private String complaintNumber;
    
    private String status; // PENDING, APPROVED, PAID, REJECTED
    
    // Default constructor
    public StaffExpenseRequestDTO() {}
    
    // Getters and setters
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getExpenseDate() {
        return expenseDate;
    }
    
    public void setExpenseDate(String expenseDate) {
        this.expenseDate = expenseDate;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public String getComplaintNumber() {
        return complaintNumber;
    }
    
    public void setComplaintNumber(String complaintNumber) {
        this.complaintNumber = complaintNumber;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    /**
     * Convert the string date to LocalDateTime
     */
    public LocalDateTime getParsedExpenseDate() {
        if (expenseDate == null || expenseDate.trim().isEmpty()) {
            return LocalDateTime.now();
        }
        
        try {
            String dateStr = expenseDate.trim();
            
            // Handle ISO string with Z suffix
            if (dateStr.endsWith("Z")) {
                dateStr = dateStr.substring(0, dateStr.length() - 1);
            }
            
            // Handle milliseconds if present
            if (dateStr.contains(".")) {
                dateStr = dateStr.substring(0, dateStr.lastIndexOf("."));
            }
            
            // If it's just a date (YYYY-MM-DD), add time component
            if (dateStr.length() == 10 && dateStr.matches("\\d{4}-\\d{2}-\\d{2}")) {
                dateStr += "T00:00:00";
            }
            
            return LocalDateTime.parse(dateStr);
        } catch (Exception e) {
            // If parsing fails, try as LocalDate and convert to LocalDateTime
            try {
                java.time.LocalDate date = java.time.LocalDate.parse(expenseDate);
                return date.atStartOfDay();
            } catch (Exception ex) {
                // Fallback to current time
                return LocalDateTime.now();
            }
        }
    }
}
