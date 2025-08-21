package com.aarohi.tms.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aarohi.tms.entity.Role;
import com.aarohi.tms.entity.User;
import com.aarohi.tms.repository.UserRepository;

/**
 * Service class for User management operations
 */
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Create a new user
     */
    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    
    /**
     * Update user information
     */
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        // Validate username uniqueness (if changed)
        if (!user.getUsername().equals(userDetails.getUsername()) && 
            userRepository.existsByUsername(userDetails.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }
        
        // Validate email uniqueness (if changed and not null/empty)
        if (userDetails.getEmail() != null && !userDetails.getEmail().trim().isEmpty()) {
            if (!userDetails.getEmail().equals(user.getEmail()) && 
                userRepository.existsByEmail(userDetails.getEmail())) {
                throw new RuntimeException("Email is already in use!");
            }
        }
        
        // Validate mobile number uniqueness (if changed)
        if (!user.getMobileNumber().equals(userDetails.getMobileNumber()) && 
            userRepository.existsByMobileNumber(userDetails.getMobileNumber())) {
            throw new RuntimeException("Mobile number is already in use!");
        }
        
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        user.setFullName(userDetails.getFullName());
        user.setMobileNumber(userDetails.getMobileNumber());
        user.setRole(userDetails.getRole());
        user.setIsActive(userDetails.getIsActive());
        
        // Only update password if provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        
        return userRepository.save(user);
    }
    
    /**
     * Get user by ID
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    /**
     * Get user by username
     */
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    /**
     * Get all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * Get users by role
     */
    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }
    
    /**
     * Get active staff members
     */
    public List<User> getActiveStaffMembers() {
        return userRepository.findActiveStaffMembers();
    }
    
    /**
     * Get all staff members (active and inactive)
     */
    public List<User> getAllStaff() {
        return userRepository.findByRole(Role.STAFF);
    }
    
    /**
     * Delete user by ID
     */
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        userRepository.delete(user);
    }
    
    /**
     * Deactivate user (soft delete)
     */
    public User deactivateUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setIsActive(false);
        return userRepository.save(user);
    }
    
    /**
     * Activate user
     */
    public User activateUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setIsActive(true);
        return userRepository.save(user);
    }
    
    /**
     * Check if username exists
     */
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    /**
     * Check if email exists
     */
    public boolean existsByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return userRepository.existsByEmail(email);
    }
    
    /**
     * Check if mobile number exists
     */
    public boolean existsByMobileNumber(String mobileNumber) {
        return userRepository.existsByMobileNumber(mobileNumber);
    }
    
    /**
     * Get user statistics
     */
    public UserStats getUserStats() {
        Long totalUsers = userRepository.count();
        Long totalAdmins = userRepository.countActiveUsersByRole(Role.ADMIN);
        Long totalStaff = userRepository.countActiveUsersByRole(Role.STAFF);
        
        return new UserStats(totalUsers, totalAdmins, totalStaff);
    }
    
    /**
     * User statistics inner class
     */
    public static class UserStats {
        private Long totalUsers;
        private Long totalAdmins;
        private Long totalStaff;
        
        public UserStats(Long totalUsers, Long totalAdmins, Long totalStaff) {
            this.totalUsers = totalUsers;
            this.totalAdmins = totalAdmins;
            this.totalStaff = totalStaff;
        }
        
        // Getters
        public Long getTotalUsers() { return totalUsers; }
        public Long getTotalAdmins() { return totalAdmins; }
        public Long getTotalStaff() { return totalStaff; }
        
        // Setters
        public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
        public void setTotalAdmins(Long totalAdmins) { this.totalAdmins = totalAdmins; }
        public void setTotalStaff(Long totalStaff) { this.totalStaff = totalStaff; }
    }
}
