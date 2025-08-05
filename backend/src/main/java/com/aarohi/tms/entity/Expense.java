package com.aarohi.tms.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
 * Expense entity for tracking expenses related to complaints
 * Staff can add expenses against assigned complaints
 */
@Entity
@Table(name = "expenses")
public class Expense {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(name = "description")
    private String description;
    
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "amount", precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "expense_date")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime expenseDate;
    
    @Column(name = "receipt_number")
    private String receiptNumber;
    
    @Column(name = "vendor_name")
    private String vendorName;
    
    @Column(name = "notes")
    private String notes;
    
    // Many expenses belong to one complaint
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;
    
    // Expense added by which user (staff)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by_user_id")
    private User addedBy;
    
    // Constructors
    public Expense() {
        this.expenseDate = LocalDateTime.now();
    }
    
    public Expense(String description, BigDecimal amount, Complaint complaint, User addedBy) {
        this.description = description;
        this.amount = amount;
        this.complaint = complaint;
        this.addedBy = addedBy;
        this.expenseDate = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
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
    
    public String getReceiptNumber() {
        return receiptNumber;
    }
    
    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }
    
    public String getVendorName() {
        return vendorName;
    }
    
    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public Complaint getComplaint() {
        return complaint;
    }
    
    public void setComplaint(Complaint complaint) {
        this.complaint = complaint;
    }
    
    public User getAddedBy() {
        return addedBy;
    }
    
    public void setAddedBy(User addedBy) {
        this.addedBy = addedBy;
    }
}
