package com.skillforge.controller;

import com.skillforge.dto.EnrollmentDTO;
import com.skillforge.service.EnrollmentService;
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
 * Enrollments Controller - Handles course enrollment endpoints
 * 
 * Endpoints:
 * - POST /api/enrollments - Enroll in a course
 * - GET /api/enrollments/me - Get user's enrollments
 * - GET /api/enrollments/{id} - Get specific enrollment details
 * 
 * All endpoints require JWT authentication
 */
@RestController
@RequestMapping("/api/enrollments")
@Tag(name = "Enrollments", description = "User course enrollment endpoints")
public class EnrollmentsController {
    
    private static final Logger log = LoggerFactory.getLogger(EnrollmentsController.class);

    @Autowired
    private EnrollmentService enrollmentService;

    /**
     * POST /api/enrollments
     * Enroll user in a course
     * 
     * Request body: { courseId }
     * Response: EnrollmentDTO
     * Status: 201 Created
     */
    @PostMapping
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Enroll in a course",
            description = "Enroll the authenticated user in a course")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Successfully enrolled",
                    content = @Content(schema = @Schema(implementation = EnrollmentDTO.class))),
            @ApiResponse(responseCode = "400", description = "Course not found or already enrolled"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - token required")
    })
    public ResponseEntity<?> enrollInCourse(@RequestBody Map<String, String> request) {
        try {
            Long userId = extractUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid token"));
            }

            String courseId = request.get("courseId");
            if (courseId == null || courseId.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("courseId is required"));
            }

            EnrollmentDTO enrollment = enrollmentService.enrollInCourse(userId, courseId);
            return ResponseEntity.status(HttpStatus.CREATED).body(enrollment);
        } catch (IllegalArgumentException e) {
            log.warn("Enrollment failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error enrolling user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Enrollment failed"));
        }
    }

    /**
     * GET /api/enrollments/me
     * Get all enrollments for the current user
     * 
     * Response: { count, enrollments }
     * Status: 200 OK
     */
    @GetMapping("/me")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get my enrollments",
            description = "Retrieve all courses the authenticated user is enrolled in")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of enrollments",
                    content = @Content(schema = @Schema(implementation = EnrollmentListResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - token required")
    })
    public ResponseEntity<?> getMyEnrollments() {
        try {
            Long userId = extractUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid token"));
            }

            List<EnrollmentDTO> enrollments = enrollmentService.getMyEnrollments(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("count", enrollments.size());
            response.put("enrollments", enrollments);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching enrollments", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch enrollments"));
        }
    }

    /**
     * GET /api/enrollments/{id}
     * Get specific enrollment details
     * 
     * Path parameter: id (enrollment ID)
     * Response: EnrollmentDTO
     * Status: 200 OK or 404 Not Found
     */
    @GetMapping("/{id}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get enrollment details",
            description = "Retrieve details for a specific enrollment")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Enrollment details",
                    content = @Content(schema = @Schema(implementation = EnrollmentDTO.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - token required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - cannot access other user's enrollment"),
            @ApiResponse(responseCode = "404", description = "Enrollment not found")
    })
    public ResponseEntity<?> getEnrollmentById(@PathVariable Long id) {
        try {
            Long userId = extractUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid token"));
            }

            EnrollmentDTO enrollment = enrollmentService.getEnrollmentById(id, userId);
            return ResponseEntity.ok(enrollment);
        } catch (IllegalArgumentException e) {
            String message = e.getMessage();
            if (message.contains("Unauthorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse(message));
            }
            log.warn("Enrollment not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching enrollment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch enrollment"));
        }
    }

    /**
     * Extract userId from JWT authentication
     */
    private Long extractUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof Long) {
            return (Long) auth.getPrincipal();
        }
        return null;
    }

    // Response DTOs

    public static class EnrollmentListResponse {
        public int count;
        public List<EnrollmentDTO> enrollments;
    }

    public static class ErrorResponse {
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}
