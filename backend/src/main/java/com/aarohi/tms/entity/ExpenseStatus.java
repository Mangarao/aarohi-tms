package com.aarohi.tms.entity;

/**
 * Enum for expense status
 */
public enum ExpenseStatus {
    PENDING,     // Expense submitted, waiting for approval
    APPROVED,    // Expense approved for payment
    PAID,        // Expense has been paid
    REJECTED     // Expense rejected
}
