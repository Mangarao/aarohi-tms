package com.aarohi.tms.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("application", "Aarohi Task Management System");
        response.put("version", "1.0.0");
        response.put("deployment", "Non-Docker VPS");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> response = new HashMap<>();
        response.put("application", "Aarohi Task Management System");
        response.put("version", "1.0.0");
        response.put("description", "Task Management System for Aarohi Sewing Enterprises");
        response.put("timestamp", LocalDateTime.now());
        response.put("deployment", "Direct VPS Deployment");
        response.put("server", "BigRock VPS - 119.18.55.169");
        
        return ResponseEntity.ok(response);
    }
}
