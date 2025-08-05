package com.aarohi.tms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.aarohi.tms.entity.Role;
import com.aarohi.tms.entity.User;

/**
 * Repository interface for User entity
 * Provides database operations for user management
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by username
     */
    Optional<User> findByUsername(String username);
    
    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Find user by mobile number
     */
    Optional<User> findByMobileNumber(String mobileNumber);
    
    /**
     * Check if username exists
     */
    Boolean existsByUsername(String username);
    
    /**
     * Check if email exists
     */
    Boolean existsByEmail(String email);
    
    /**
     * Check if mobile number exists
     */
    Boolean existsByMobileNumber(String mobileNumber);
    
    /**
     * Find all users by role
     */
    List<User> findByRole(Role role);
    
    /**
     * Find all active users by role
     */
    List<User> findByRoleAndIsActive(Role role, Boolean isActive);
    
    /**
     * Find all active staff members
     */
    @Query("SELECT u FROM User u WHERE u.role = 'STAFF' AND u.isActive = true")
    List<User> findActiveStaffMembers();
    
    /**
     * Count active users by role
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.isActive = true")
    Long countActiveUsersByRole(@Param("role") Role role);
}
