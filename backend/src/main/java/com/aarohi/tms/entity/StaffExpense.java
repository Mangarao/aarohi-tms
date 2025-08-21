package com.aarohi.tms.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * StaffExpense entity for tracking independent staff expenses
 * Staff can add personal expenses for reimbursement
 */
@Entity
@Table(name = "staff_expenses")
public class StaffExpense {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "amount", precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "expense_date")
    private LocalDateTime expenseDate;
    
    @NotBlank
    @Column(name = "reason", length = 500)
    private String reason;
    
    @Column(name = "complaint_number")
    private String complaintNumber; // Optional complaint reference
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ExpenseStatus status = ExpenseStatus.PENDING;
    
    @Column(name = "is_paid_by_company")
    private Boolean isPaidByCompany = false;
    
    @Column(name = "paid_date")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime paidDate;
    
    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    // Expense added by which user (staff)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_user_id", nullable = false)
    @JsonIgnore
    private User staffUser;
    
    // Constructors
    public StaffExpense() {
        this.expenseDate = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public StaffExpense(BigDecimal amount, String reason, User staffUser) {
        this.amount = amount;
        this.reason = reason;
        this.staffUser = staffUser;
        this.expenseDate = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public LocalDateTime getExpenseDate() {
        return expenseDate;
    }
    
    public void setExpenseDate(LocalDateTime expenseDate) {
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
    
    public ExpenseStatus getStatus() {
        return status;
    }
    
    public void setStatus(ExpenseStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
    
    public Boolean getIsPaidByCompany() {
        return isPaidByCompany;
    }
    
    public void setIsPaidByCompany(Boolean isPaidByCompany) {
        this.isPaidByCompany = isPaidByCompany;
        if (isPaidByCompany && this.paidDate == null) {
            this.paidDate = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }
    
    public LocalDateTime getPaidDate() {
        return paidDate;
    }
    
    public void setPaidDate(LocalDateTime paidDate) {
        this.paidDate = paidDate;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public User getStaffUser() {
        return staffUser;
    }
    
    public void setStaffUser(User staffUser) {
        this.staffUser = staffUser;
    }
    
    // Helper methods
    public boolean isEditable() {
        return !Boolean.TRUE.equals(this.isPaidByCompany);
    }
    
    @Override
    public String toString() {
        return "StaffExpense{" +
                "id=" + id +
                ", amount=" + amount +
                ", reason='" + reason + '\'' +
                ", complaintNumber='" + complaintNumber + '\'' +
                ", isPaidByCompany=" + isPaidByCompany +
                ", expenseDate=" + expenseDate +
                '}';
    }
}
