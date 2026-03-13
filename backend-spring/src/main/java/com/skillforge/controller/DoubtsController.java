package com.skillforge.controller;

import com.skillforge.dto.DoubtDTO;
import com.skillforge.entity.User;
import com.skillforge.service.DoubtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Doubts Controller - Handles student doubt submissions and queries
 * 
 * Endpoints:
 * - POST /api/doubts - Submit a new doubt (student)
 * - GET /api/doubts - Get my doubts (student)
 * - GET /api/doubts/{courseId} - Get my doubts for a specific course
 */
@RestController
@RequestMapping("/api/doubts")
@Tag(name = "Doubts", description = "Student doubt submission and management")
@SecurityRequirement(name = "Bearer Authentication")
public class DoubtsController {
    
    private static final Logger log = LoggerFactory.getLogger(DoubtsController.class);
    
    @Autowired
    private DoubtService doubtService;
    
    /**
     * POST /api/doubts
     * Submit a new doubt
     */
    @PostMapping
    @Operation(summary = "Submit a new doubt",
            description = "Submit a new doubt or query for a course")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Doubt submitted successfully",
                    content = @Content(schema = @Schema(implementation = DoubtDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid course or data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - token required")
    })
    public ResponseEntity<?> submitDoubt(@RequestBody SubmitDoubtRequest request) {
        try {
            User user = getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Unauthorized - authentication required"));
            }
            
            DoubtDTO doubt = doubtService.submitDoubt(
                    user.getId(),
                    request.getCourseId(),
                    request.getTitle(),
                    request.getDescription(),
                    request.getModuleId()
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(doubt);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error submitting doubt", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to submit doubt"));
        }
    }
    
    /**
     * GET /api/doubts
     * Get my doubts
     */
    @GetMapping
    @Operation(summary = "Get my doubts",
            description = "Get all doubts submitted by the current student")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of my doubts"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - token required")
    })
    public ResponseEntity<?> getMyDoubts() {
        try {
            User user = getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Unauthorized - authentication required"));
            }
            
            List<DoubtDTO> doubts = doubtService.getDoubtsByStudent(user.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("count", doubts.size());
            response.put("doubts", doubts);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching doubts", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch doubts"));
        }
    }
    
    /**
     * Helper method to get current user from security context
     */
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        if (auth.getDetails() instanceof User user) {
            return user;
        }
        return null;
    }
    
    // Helper classes
    
    public static class SubmitDoubtRequest {
        private Long courseId;
        private String title;
        private String description;
        private String moduleId;
        
        public SubmitDoubtRequest() {}
        
        public Long getCourseId() {
            return courseId;
        }
        
        public void setCourseId(Long courseId) {
            this.courseId = courseId;
        }
        
        public String getTitle() {
            return title;
        }
        
        public void setTitle(String title) {
            this.title = title;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
        
        public String getModuleId() {
            return moduleId;
        }
        
        public void setModuleId(String moduleId) {
            this.moduleId = moduleId;
        }
    }
    
    public static class ErrorResponse {
        private String error;
        
        public ErrorResponse(String error) {
            this.error = error;
        }
        
        public String getError() {
            return error;
        }
        
        public void setError(String error) {
            this.error = error;
        }
    }
}
