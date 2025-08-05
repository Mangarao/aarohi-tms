package com.aarohi.tms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aarohi.tms.dto.MessageResponse;
import com.aarohi.tms.entity.Complaint;
import com.aarohi.tms.entity.ComplaintType;
import com.aarohi.tms.entity.Priority;
import com.aarohi.tms.entity.Status;
import com.aarohi.tms.security.UserPrincipal;
import com.aarohi.tms.service.ComplaintService;

import jakarta.validation.Valid;

/**
 * REST Controller for complaint management operations
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/complaints")
public class ComplaintController {
    
    @Autowired
    private ComplaintService complaintService;
    
    /**
     * Get all complaints (Admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        List<Complaint> complaints = complaintService.getAllComplaints();
        return ResponseEntity.ok(complaints);
    }
    
    /**
     * Get complaint by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @complaintService.getComplaintById(#id).get().assignedStaff?.id == authentication.principal.id")
    public ResponseEntity<?> getComplaintById(@PathVariable Long id) {
        return complaintService.getComplaintById(id)
                .map(complaint -> ResponseEntity.ok().body(complaint))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create new complaint
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> createComplaint(@Valid @RequestBody Complaint complaint) {
        try {
            Complaint createdComplaint = complaintService.createComplaint(complaint);
            return ResponseEntity.ok(createdComplaint);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error creating complaint: " + e.getMessage()));
        }
    }
    
    /**
     * Update complaint
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (@complaintService.getComplaintById(#id).isPresent() and @complaintService.getComplaintById(#id).get().assignedStaff?.id == authentication.principal.id)")
    public ResponseEntity<?> updateComplaint(@PathVariable Long id, @Valid @RequestBody Complaint complaintDetails) {
        try {
            Complaint updatedComplaint = complaintService.updateComplaint(id, complaintDetails);
            return ResponseEntity.ok(updatedComplaint);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error updating complaint: " + e.getMessage()));
        }
    }
    
    /**
     * Delete complaint (Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteComplaint(@PathVariable Long id) {
        try {
            complaintService.deleteComplaint(id);
            return ResponseEntity.ok(new MessageResponse("Complaint deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Assign complaint to staff (Admin only)
     */
    @PutMapping("/{complaintId}/assign/{staffId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignComplaint(@PathVariable Long complaintId, @PathVariable Long staffId) {
        try {
            Complaint complaint = complaintService.assignComplaint(complaintId, staffId);
            return ResponseEntity.ok(complaint);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    /**
     * Update complaint status
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or (@complaintService.getComplaintById(#id).isPresent() and @complaintService.getComplaintById(#id).get().assignedStaff?.id == authentication.principal.id)")
    public ResponseEntity<?> updateComplaintStatus(@PathVariable Long id, 
                                                   @RequestParam Status status,
                                                   @RequestParam(required = false) String resolutionNotes) {
        try {
            Complaint complaint = complaintService.updateComplaintStatus(id, status, resolutionNotes);
            return ResponseEntity.ok(complaint);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get complaints by status
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Complaint>> getComplaintsByStatus(@PathVariable Status status) {
        List<Complaint> complaints = complaintService.getComplaintsByStatus(status);
        return ResponseEntity.ok(complaints);
    }
    
    /**
     * Get complaints by priority
     */
    @GetMapping("/priority/{priority}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Complaint>> getComplaintsByPriority(@PathVariable Priority priority) {
        List<Complaint> complaints = complaintService.getComplaintsByPriority(priority);
        return ResponseEntity.ok(complaints);
    }
    
    /**
     * Get complaints assigned to current staff member
     */
    @GetMapping("/my-assignments")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<Complaint>> getMyAssignedComplaints(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<Complaint> complaints = complaintService.getComplaintsByAssignedStaff(userPrincipal.getId());
        return ResponseEntity.ok(complaints);
    }
    
    /**
     * Get complaints by assigned staff (Admin only)
     */
    @GetMapping("/staff/{staffId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Complaint>> getComplaintsByAssignedStaff(@PathVariable Long staffId) {
        List<Complaint> complaints = complaintService.getComplaintsByAssignedStaff(staffId);
        return ResponseEntity.ok(complaints);
    }
    
    /**
     * Get complaints by mobile number
     */
    @GetMapping("/mobile/{mobileNumber}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Complaint>> getComplaintsByMobileNumber(@PathVariable String mobileNumber) {
        List<Complaint> complaints = complaintService.getComplaintsByMobileNumber(mobileNumber);
        return ResponseEntity.ok(complaints);
    }
    
    /**
     * Search complaints with filters (Admin only)
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Complaint>> searchComplaints(
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String mobileNumber,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) ComplaintType complaintType,
            @RequestParam(required = false) Long assignedStaffId) {
        
        List<Complaint> complaints = complaintService.searchComplaints(
                customerName, mobileNumber, status, priority, complaintType, assignedStaffId);
        return ResponseEntity.ok(complaints);
    }
    
    /**
     * Get recent complaints (Admin only)
     */
    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Complaint>> getRecentComplaints() {
        List<Complaint> complaints = complaintService.getRecentComplaints();
        return ResponseEntity.ok(complaints);
    }
    
    /**
     * Get high priority open complaints (Admin only)
     */
    @GetMapping("/high-priority")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Complaint>> getHighPriorityOpenComplaints() {
        List<Complaint> complaints = complaintService.getHighPriorityOpenComplaints();
        return ResponseEntity.ok(complaints);
    }
    
    /**
     * Get complaint statistics (Admin only)
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComplaintService.ComplaintStats> getComplaintStats() {
        ComplaintService.ComplaintStats stats = complaintService.getComplaintStats();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Create public complaint (no authentication required)
     */
    @PostMapping("/public")
    public ResponseEntity<?> createPublicComplaint(@Valid @RequestBody Complaint complaint) {
        try {
            // Check if customer already has an active complaint
            List<Complaint> existingComplaints = complaintService.getComplaintsByMobileAndActiveStatus(complaint.getMobileNumber());
            if (!existingComplaints.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("You already have an active complaint. Please wait for it to be resolved before submitting a new one."));
            }
            
            // Set default values for public complaints
            complaint.setStatus(Status.OPEN);
            complaint.setPriority(Priority.MEDIUM);
            
            Complaint createdComplaint = complaintService.createComplaint(complaint);
            return ResponseEntity.ok(createdComplaint);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error creating complaint: " + e.getMessage()));
        }
    }
    
    /**
     * Check for existing active complaint by mobile number (public access)
     */
    @GetMapping("/check-existing/{mobileNumber}")
    public ResponseEntity<?> checkExistingComplaint(@PathVariable String mobileNumber) {
        try {
            List<Complaint> existingComplaints = complaintService.getComplaintsByMobileAndActiveStatus(mobileNumber);
            if (!existingComplaints.isEmpty()) {
                return ResponseEntity.ok(existingComplaints.get(0));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error checking existing complaint: " + e.getMessage()));
        }
    }
}
