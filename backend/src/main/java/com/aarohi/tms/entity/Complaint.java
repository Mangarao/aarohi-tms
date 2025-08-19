package com.aarohi.tms.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Complaint entity representing service requests and complaints
 * Contains all complaint-related information and tracking details
 */
@Entity
@Table(name = "complaints")
public class Complaint {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max = 100)
    private String customerName;
    
    @NotBlank
    @Size(max = 15)
    @Column(name = "mobile_number")
    private String mobileNumber; // Primary key for customer identification
    
    @Size(max = 100)
    private String email;
    
    @NotBlank
    @Size(max = 500)
    private String address;
    
    @NotBlank
    @Size(max = 50)
    private String city;
    
    @NotBlank
    @Size(max = 50)
    private String state;
    
    @NotBlank
    @Size(max = 100)
    @Column(name = "machine_name_model")
    private String machineNameModel;
    
    @NotBlank
    @Size(max = 1000)
    @Column(name = "problem_description")
    private String problemDescription;
    
    @Column(name = "created_date")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdDate;
    
    @Column(name = "under_warranty")
    private Boolean underWarranty = false;
    
    @Column(name = "machine_purchase_date")
    private LocalDate machinePurchaseDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "complaint_type")
    private ComplaintType complaintType;
    
    @Enumerated(EnumType.STRING)
    private Status status = Status.OPEN;
    
    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;
    
    // Many complaints can be assigned to one staff member
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id")
    @JsonIgnore
    private User assignedStaff;
    
    // One complaint can have many expenses
    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Expense> expenses = new ArrayList<>();
    
    @Column(name = "resolution_notes")
    private String resolutionNotes;
    
    @Column(name = "schedule_date")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime scheduleDate;
    
    @Column(name = "completion_date")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime completionDate;
    
    @Column(name = "updated_date")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedDate;
    
    // Constructors
    public Complaint() {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getCustomerName() {
        return customerName;
    }
    
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
    
    public String getMobileNumber() {
        return mobileNumber;
    }
    
    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
    
    public String getMachineNameModel() {
        return machineNameModel;
    }
    
    public void setMachineNameModel(String machineNameModel) {
        this.machineNameModel = machineNameModel;
    }
    
    public String getProblemDescription() {
        return problemDescription;
    }
    
    public void setProblemDescription(String problemDescription) {
        this.problemDescription = problemDescription;
    }
    
    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
    
    public Boolean getUnderWarranty() {
        return underWarranty;
    }
    
    public void setUnderWarranty(Boolean underWarranty) {
        this.underWarranty = underWarranty;
    }
    
    public LocalDate getMachinePurchaseDate() {
        return machinePurchaseDate;
    }
    
    public void setMachinePurchaseDate(LocalDate machinePurchaseDate) {
        this.machinePurchaseDate = machinePurchaseDate;
    }
    
    public ComplaintType getComplaintType() {
        return complaintType;
    }
    
    public void setComplaintType(ComplaintType complaintType) {
        this.complaintType = complaintType;
    }
    
    public Status getStatus() {
        return status;
    }
    
    public void setStatus(Status status) {
        this.status = status;
        this.updatedDate = LocalDateTime.now();
    }
    
    public Priority getPriority() {
        return priority;
    }
    
    public void setPriority(Priority priority) {
        this.priority = priority;
    }
    
    public User getAssignedStaff() {
        return assignedStaff;
    }
    
    public void setAssignedStaff(User assignedStaff) {
        this.assignedStaff = assignedStaff;
    }
    
    public List<Expense> getExpenses() {
        return expenses;
    }
    
    public void setExpenses(List<Expense> expenses) {
        this.expenses = expenses;
    }
    
    public String getResolutionNotes() {
        return resolutionNotes;
    }
    
    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
    
    public LocalDateTime getScheduleDate() {
        return scheduleDate;
    }
    
    public void setScheduleDate(LocalDateTime scheduleDate) {
        this.scheduleDate = scheduleDate;
    }
    
    public LocalDateTime getCompletionDate() {
        return completionDate;
    }
    
    public void setCompletionDate(LocalDateTime completionDate) {
        this.completionDate = completionDate;
    }
    
    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }
    
    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }
}
