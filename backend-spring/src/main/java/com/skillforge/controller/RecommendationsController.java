package com.skillforge.controller;

import com.skillforge.service.RecommendationService;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Recommendations Controller - Handles personalized recommendation endpoint
 * 
 * Endpoints:
 * - GET /api/recommendations/me - Get personalized course recommendations
 * 
 * This endpoint:
 * 1. Collects user learning data (enrolled courses, progress, quiz scores)
 * 2. Calls FastAPI ML service for recommendations
 * 3. Returns recommendations (or fallback if ML service unavailable)
 * 
 * All endpoints require JWT authentication
 */
@RestController
@RequestMapping("/api/recommendations")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Recommendations", description = "Personalized course recommendation endpoints")
public class RecommendationsController {
    
    private static final Logger log = LoggerFactory.getLogger(RecommendationsController.class);

    @Autowired
    private RecommendationService recommendationService;

    /**
     * GET /api/recommendations/me
     * Get personalized course recommendations for the current user
     * 
     * Process:
     * 1. Extracts user ID from JWT token
     * 2. Calls recommendation service which:
     *    a. Gathers user learning data (enrollments, progress, quiz attempts)
     *    b. Sends request to FastAPI /recommend endpoint
     *    c. Returns recommendations from ML service
     *    d. Falls back to popular courses if ML service unavailable
     * 
     * Response: { recommendedCourses[], recommendedTopics[] }
     * Status: 200 OK
     */
    @GetMapping("/me")
    @Operation(summary = "Get personalized recommendations",
            description = "Get AI-powered course recommendations based on user learning data")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Recommended courses and topics",
                    content = @Content(schema = @Schema(implementation = RecommendationResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - token required"),
            @ApiResponse(responseCode = "500", description = "Failed to generate recommendations")
    })
    public ResponseEntity<?> getRecommendations() {
        try {
            Long userId = extractUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid token"));
            }

            log.debug("Fetching recommendations for user: {}", userId);
            RecommendationService.RecommendationResponse recommendations =
                    recommendationService.getRecommendations(userId);

            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            log.error("Error fetching recommendations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to generate recommendations"));
        }
    }

    /**
     * Extract userId from JWT authentication context
     */
    private Long extractUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof Long) {
            return (Long) auth.getPrincipal();
        }
        return null;
    }

    // Response DTOs

    /**
     * Recommendation response structure
     * Matches original Express backend response exactly
     */
    public static class RecommendationResponse {
        public Object[] recommendedCourses;
        public String[] recommendedTopics;
    }

    public static class ErrorResponse {
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}
