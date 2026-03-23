package com.skillforge.controller;

import com.skillforge.dto.ProgressDTO;
import com.skillforge.service.ProgressService;
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
 * Progress Controller - Handles learning progress and quiz endpoints
 * 
 * Endpoints:
 * - POST /api/progress/complete - Mark module as complete
 * - GET /api/progress/me - Get user's progress
 * - POST /api/quiz/submit - Submit quiz attempt
 * 
 * All endpoints require JWT authentication
 */
@RestController
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Progress & Quiz", description = "Learning progress and quiz submission endpoints")
public class ProgressController {
    
    private static final Logger log = LoggerFactory.getLogger(ProgressController.class);

    @Autowired
    private ProgressService progressService;

    /**
     * POST /api/progress/complete
     * Mark a module as complete
     * 
     * Request body: { courseId, moduleId }
     * Response: ProgressDTO
     * Status: 200 OK
     */
    @PostMapping("/api/progress/complete")
    @Operation(summary = "Mark module as complete",
            description = "Mark a course module as completed")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Progress updated",
                    content = @Content(schema = @Schema(implementation = ProgressDTO.class))),
            @ApiResponse(responseCode = "400", description = "Not enrolled in course"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - token required")
    })
    public ResponseEntity<?> markModuleComplete(@RequestBody Map<String, String> request) {
        try {
            Long userId = extractUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid token"));
            }

            String courseId = request.get("courseId");
            String moduleId = request.get("moduleId");

            if (courseId == null || moduleId == null) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("courseId and moduleId are required"));
            }

            ProgressDTO progress = progressService.markModuleComplete(userId, courseId, moduleId);
            return ResponseEntity.ok(progress);
        } catch (IllegalArgumentException e) {
            log.warn("Mark complete failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error marking module complete", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to mark module complete"));
        }
    }

    /**
     * GET /api/progress/me
     * Get user's learning progress across all courses
     * 
     * Response: { count, summary: [ {course, totalModules, completedModules, completionPercentage, modules} ] }
     * Status: 200 OK
     */
    @GetMapping("/api/progress/me")
    @Operation(summary = "Get my progress",
            description = "Retrieve learning progress across all enrolled courses")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Progress summary",
                    content = @Content(schema = @Schema(implementation = ProgressSummaryResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - token required")
    })
    public ResponseEntity<?> getMyProgress() {
        try {
            Long userId = extractUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid token"));
            }

            ProgressService.ProgressSummaryResponse progressSummary = progressService.getMyProgress(userId);
            return ResponseEntity.ok(progressSummary);
        } catch (Exception e) {
            log.error("Error fetching progress", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch progress"));
        }
    }

    /**
     * POST /api/quiz/submit
     * Submit a quiz attempt
     * 
     * Request body: { courseId, moduleId, answers[], timeTakenSec }
     * Response: { score, passed, feedback, attempt }
     * Status: 201 Created
     */
    @PostMapping("/api/quiz/submit")
    @Operation(summary = "Submit quiz attempt",
            description = "Submit answers for a course module quiz")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Quiz submitted",
                    content = @Content(schema = @Schema(implementation = QuizSubmitResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request or not enrolled"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - token required")
    })
    public ResponseEntity<?> submitQuiz(@RequestBody Map<String, Object> request) {
        try {
            Long userId = extractUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid token"));
            }

            String courseId = (String) request.get("courseId");
            String moduleId = (String) request.get("moduleId");
            List<Boolean> answers = (List<Boolean>) request.get("answers");
            List<Integer> selectedAnswers = null;
            Long timeTakenSec = null;
            Integer proctoringViolationCount = null;
            Boolean proctoringConfirmed = null;
            String proctoringFailureReason = null;
            Boolean proctoringFailed = null;
            if (request.get("selectedAnswers") instanceof List<?> rawSelectedAnswers) {
                selectedAnswers = rawSelectedAnswers.stream()
                        .map(item -> item == null ? null : ((Number) item).intValue())
                        .toList();
            }
            if (request.get("timeTakenSec") != null) {
                timeTakenSec = ((Number) request.get("timeTakenSec")).longValue();
            }
            if (request.get("proctoringViolationCount") != null) {
                proctoringViolationCount = ((Number) request.get("proctoringViolationCount")).intValue();
            }
            if (request.get("proctoringConfirmed") != null) {
                proctoringConfirmed = (Boolean) request.get("proctoringConfirmed");
            }
            if (request.get("proctoringFailureReason") != null) {
                proctoringFailureReason = String.valueOf(request.get("proctoringFailureReason"));
            }
            if (request.get("proctoringFailed") != null) {
                proctoringFailed = (Boolean) request.get("proctoringFailed");
            }

            boolean isProctoringFailedSubmission = Boolean.TRUE.equals(proctoringFailed);
            if (courseId == null || moduleId == null || (!isProctoringFailedSubmission && answers == null && selectedAnswers == null)) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("courseId, moduleId, and answers are required"));
            }

            ProgressService.QuizSubmitResponse response = progressService.submitQuiz(
                    userId, courseId, moduleId, answers, selectedAnswers, timeTakenSec,
                    proctoringViolationCount, proctoringConfirmed, proctoringFailureReason, proctoringFailed);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.warn("Quiz submission failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error submitting quiz", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to submit quiz"));
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

    public static class ProgressSummaryResponse {
        public int count;
        public List<ProgressService.ProgressSummaryItem> summary;
    }

    public static class QuizSubmitResponse {
        public Integer score;
        public Boolean passed;
        public String feedback;
        public Long attemptId;
    }

    public static class ErrorResponse {
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}
