package com.skillforge.controller;

import com.skillforge.dto.CourseDTO;
import com.skillforge.entity.User;
import com.skillforge.service.CourseService;
import com.skillforge.security.AuthorizationUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
 * Courses Controller - Handles course-related endpoints
 * 
 * Endpoints:
 * - GET /api/courses - Get all courses (with filtering and sorting)
 * - GET /api/courses/{id} - Get single course by ID
 * - POST /api/courses - Create new course (admin only)
 * 
 * Supports filters: search, category, level, sort, featured
 */
@RestController
@RequestMapping("/api/courses")
@Tag(name = "Courses", description = "Course catalog endpoints")
public class CoursesController {
    
    private static final Logger log = LoggerFactory.getLogger(CoursesController.class);

    @Autowired
    private CourseService courseService;

    @Autowired
    private AuthorizationUtil authorizationUtil;

    /**
     * GET /api/courses
     * Get all courses with optional filtering and sorting
     * 
     * Query Parameters:
     * - search: Search in title, description, tags (case-insensitive)
     * - category: Filter by category (DSA, DBMS, OS, CN, OOP, System Design, AI/ML Basics, Cyber Security)
     * - level: Filter by level (Beginner, Intermediate, Advanced)
     * - sort: Sort order (newest, rating, popularity)
     * - featured: If true, limit to 6 featured courses
     * 
     * Response: { count, courses }
     */
    @GetMapping
    @Operation(summary = "Get all courses",
            description = "Retrieve courses with optional filtering, sorting, and search")
    @ApiResponse(responseCode = "200", description = "List of courses",
            content = @Content(schema = @Schema(implementation = CourseListResponse.class)))
    public ResponseEntity<?> getAllCourses(
            @Parameter(description = "Search term (title, description, tags)")
            @RequestParam(required = false) String search,
            
            @Parameter(description = "Filter by category")
            @RequestParam(required = false) String category,
            
            @Parameter(description = "Filter by level (Beginner, Intermediate, Advanced)")
            @RequestParam(required = false) String level,
            
            @Parameter(description = "Sort order (newest, rating, popularity)")
            @RequestParam(required = false, defaultValue = "newest") String sort,
            
            @Parameter(description = "Get only featured courses (limit=6)")
            @RequestParam(required = false) Boolean featured) {
        try {
            List<CourseDTO> courses = courseService.getAllCourses(search, category, level, sort, featured);
            
            Map<String, Object> response = new HashMap<>();
            response.put("count", courses.size());
            response.put("courses", courses);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching courses", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch courses"));
        }
    }

    /**
     * GET /api/courses/{id}
     * Get a single course by ID
     * 
     * Path Parameter:
     * - id: Course ID (numeric)
     * 
     * Response: CourseDTO with full details
     * Status: 200 OK or 404 Not Found
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get course details",
            description = "Retrieve detailed information about a specific course")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Course details",
                    content = @Content(schema = @Schema(implementation = CourseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<?> getCourseById(
            @Parameter(description = "Course ID")
            @PathVariable Long id) {
        try {
            CourseDTO course = courseService.getCourseById(id);
            return ResponseEntity.ok(course);
        } catch (IllegalArgumentException e) {
            log.warn("Course not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching course", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch course"));
        }
    }

    /**
     * POST /api/courses
     * Create a new course (admin only)
     * 
     * Security: Requires JWT token and ADMIN role
     * Request body: CourseDTO with course details
     * Response: Created CourseDTO
     * Status: 201 Created
     */
    @PostMapping
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create a new course",
            description = "Create a new course (admin only)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Course created successfully",
                    content = @Content(schema = @Schema(implementation = CourseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid course data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - token required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - admin role required")
    })
    public ResponseEntity<?> createCourse(@RequestBody CourseDTO courseDTO) {
        try {
            // Get current user from security context
            User user = getCurrentUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Unauthorized - authentication required"));
            }
            
            // Check if user is an admin
            if (!authorizationUtil.isAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - admin role required"));
            }
            
            CourseDTO created = courseService.createCourse(courseDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            log.warn("Course creation validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating course", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to create course"));
        }
    }

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

    // Response DTOs

    public static class CourseListResponse {
        public int count;
        public List<CourseDTO> courses;
    }

    public static class ErrorResponse {
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}
