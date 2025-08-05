package com.aarohi.tms.dto;

import com.aarohi.tms.entity.Role;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO for user login requests
 */
public class LoginRequest {
    
    @NotBlank
    @Size(max = 50)
    private String username;
    
    @NotBlank
    @Size(max = 120)
    private String password;
    
    @NotNull
    private Role role;
    
    // Constructors
    public LoginRequest() {}
    
    public LoginRequest(String username, String password, Role role) {
        this.username = username;
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
