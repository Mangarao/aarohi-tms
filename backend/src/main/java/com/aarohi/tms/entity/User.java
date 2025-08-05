package com.aarohi.tms.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * User entity representing both Admin and Staff users
 * Contains authentication and authorization information
 */
@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max = 50)
    @Column(unique = true)
    private String username;
    
    @Size(max = 100)
    private String email;
    
    @NotBlank
    @Size(max = 100)
    private String fullName;
    
    @NotBlank
    @Size(max = 15)
    private String mobileNumber;
    
    @NotBlank
    @Size(max = 120)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Role role;
    
    @Column(name = "created_date")
    private LocalDateTime createdDate;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    // One staff can be assigned to many complaints
    @OneToMany(mappedBy = "assignedStaff", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Complaint> assignedComplaints = new HashSet<>();
    
    // Constructors
    public User() {
        this.createdDate = LocalDateTime.now();
    }
    
    public User(String username, String email, String fullName, String mobileNumber, String password, Role role) {
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.mobileNumber = mobileNumber;
        this.password = password;
        this.role = role;
        this.createdDate = LocalDateTime.now();
        this.isActive = true;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getMobileNumber() {
        return mobileNumber;
    }
    
    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public Role getRole() {
        return role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
    
    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Set<Complaint> getAssignedComplaints() {
        return assignedComplaints;
    }
    
    public void setAssignedComplaints(Set<Complaint> assignedComplaints) {
        this.assignedComplaints = assignedComplaints;
    }
}
