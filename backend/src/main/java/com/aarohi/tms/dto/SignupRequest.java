package com.aarohi.tms.dto;

import com.aarohi.tms.entity.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for user registration/creation requests
 */
public class SignupRequest {
    
    @NotBlank
    @Size(min = 3, max = 50)
    private String username;
    
    @NotBlank
    @Size(max = 100)
    @Email
    private String email;
    
    @NotBlank
    @Size(max = 100)
    private String fullName;
    
    @NotBlank
    @Size(max = 15)
    private String mobileNumber;
    
    @NotBlank
    @Size(min = 6, max = 120)
    private String password;
    
    private Role role;
    
    // Constructors
    public SignupRequest() {}
    
    public SignupRequest(String username, String email, String fullName, String mobileNumber, String password, Role role) {
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.mobileNumber = mobileNumber;
        this.password = password;
        this.role = role;
    }
    
    // Getters and Setters
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
}
