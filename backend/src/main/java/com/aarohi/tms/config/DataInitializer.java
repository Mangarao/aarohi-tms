package com.aarohi.tms.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.aarohi.tms.entity.Role;
import com.aarohi.tms.entity.User;
import com.aarohi.tms.repository.UserRepository;

/**
 * Data initialization component to create default admin user
 */
@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Create default admin user if not exists
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@aarohi.com");
            admin.setFullName("System Administrator");
            admin.setMobileNumber("9999999999");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setIsActive(true);
            
            userRepository.save(admin);
            System.out.println("Default admin user created:");
            System.out.println("Username: admin");
            System.out.println("Password: admin123");
        }
        
        // Create default staff user if not exists
        if (!userRepository.existsByUsername("staff")) {
            User staff = new User();
            staff.setUsername("staff");
            staff.setEmail("staff@aarohi.com");
            staff.setFullName("Default Staff Member");
            staff.setMobileNumber("8888888888");
            staff.setPassword(passwordEncoder.encode("staff123"));
            staff.setRole(Role.STAFF);
            staff.setIsActive(true);
            
            userRepository.save(staff);
            System.out.println("Default staff user created:");
            System.out.println("Username: staff");
            System.out.println("Password: staff123");
        }
    }
}
