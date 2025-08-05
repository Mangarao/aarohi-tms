package com.aarohi.tms.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aarohi.tms.dto.JwtResponse;
import com.aarohi.tms.dto.LoginRequest;
import com.aarohi.tms.dto.MessageResponse;
import com.aarohi.tms.dto.SignupRequest;
import com.aarohi.tms.entity.Role;
import com.aarohi.tms.entity.User;
import com.aarohi.tms.repository.UserRepository;
import com.aarohi.tms.security.JwtUtils;
import com.aarohi.tms.security.UserPrincipal;
import com.aarohi.tms.service.UserService;

import jakarta.validation.Valid;

/**
 * REST Controller for authentication operations
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    /**
     * User login endpoint
     */
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        
        // First, check if user exists and has the correct role
        User user = userRepository.findByUsername(loginRequest.getUsername())
            .orElse(null);
            
        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: User not found!"));
        }
        
        if (!user.getRole().equals(loginRequest.getRole())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Invalid role selected for this user!"));
        }
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();
        
        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getFullName(),
                userDetails.getAuthorities().iterator().next().getAuthority()));
    }
    
    /**
     * User registration endpoint (Admin can create Staff accounts)
     */
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        
        if (userService.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }
        
        if (userService.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }
        
        if (userService.existsByMobileNumber(signUpRequest.getMobileNumber())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Mobile number is already in use!"));
        }
        
        // Create new user account
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                signUpRequest.getFullName(),
                signUpRequest.getMobileNumber(),
                signUpRequest.getPassword(),
                signUpRequest.getRole() != null ? signUpRequest.getRole() : Role.STAFF);
        
        userService.createUser(user);
        
        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
    
    /**
     * Get current user information
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Not authenticated"));
        }
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(user);
    }
    
    /**
     * Test endpoint for checking authentication
     */
    @GetMapping("/test")
    public ResponseEntity<?> testAuth() {
        return ResponseEntity.ok(new MessageResponse("Authentication test successful!"));
    }
}
