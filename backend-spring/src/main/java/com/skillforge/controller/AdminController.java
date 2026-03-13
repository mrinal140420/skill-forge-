package com.skillforge.controller;

import com.skillforge.dto.AdminDashboardSummaryDTO;
import com.skillforge.dto.CourseDTO;
import com.skillforge.dto.DoubtDTO;
import com.skillforge.dto.UserDTO;
import com.skillforge.entity.User;
import com.skillforge.service.AdminService;
import com.skillforge.service.CourseService;
import com.skillforge.service.DoubtService;
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
 * Admin Controller - Handles admin-specific endpoints
 * 
 * Endpoints:
 * - GET /api/admin/dashboard/summary - Get dashboard summary (super admin only)
 * - GET /api/admin/users - Get all users (super admin only)
 * - GET /api/admin/users/:role - Get users by role (super admin only)
 * - POST /api/admin/assign-course/:userId/:courseId - Assign course to admin
 * - GET /api/admin/my-courses - Get courses assigned to current admin
 * - POST /api/admin/course/:courseId - Update course (admin only)
 * 
 * All endpoints require JWT auth and appropriate role
 */
@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminController {
    
    private static final Logger log = LoggerFactory.getLogger(AdminController.class);
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private DoubtService doubtService;

    @Autowired
    private CourseService courseService;
    
    @Autowired
    private AuthorizationUtil authorizationUtil;
    
    /**
     * GET /api/admin/dashboard/summary
     * Get dashboard summary for super admin
     * Returns: admin stats (users, courses, enrollments, doubts, etc)
     */
    @GetMapping("/dashboard/summary")
    @Operation(summary = "Get admin dashboard summary",
            description = "Get platform-wide statistics (super admin only)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dashboard summary",
                    content = @Content(schema = @Schema(implementation = AdminDashboardSummaryDTO.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - token required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - super admin role required")
    })
    public ResponseEntity<?> getDashboardSummary() {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isSuperAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - super admin access required"));
            }
            
            AdminDashboardSummaryDTO summary = adminService.getAdminDashboardSummary(user);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error fetching dashboard summary", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch dashboard summary"));
        }
    }

    @GetMapping("/course-admin/dashboard/summary")
    @Operation(summary = "Get course admin dashboard summary",
            description = "Get assigned-course analytics for course admins and super admins")
    public ResponseEntity<?> getCourseAdminDashboardSummary() {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - admin access required"));
            }

            Map<String, Object> summary = adminService.getCourseAdminDashboardSummary(user);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error fetching course admin dashboard summary", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch dashboard summary"));
        }
    }
    
    /**
     * GET /api/admin/users
     * Get all users (super admin only)
     */
    @GetMapping("/users")
    @Operation(summary = "Get all users",
            description = "Get all users in the platform (super admin only)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of all users"),
            @ApiResponse(responseCode = "403", description = "Forbidden - super admin role required")
    })
    public ResponseEntity<?> getAllUsers() {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isSuperAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - super admin access required"));
            }
            
            List<UserDTO> users = adminService.getAllUsers();
            Map<String, Object> response = new HashMap<>();
            response.put("count", users.size());
            response.put("users", users);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch users"));
        }
    }
    
    /**
     * POST /api/admin/create-instructor
     * Create a new course admin/instructor with auto-generated password
     * Only super admin can create new instructors
     */
    @PostMapping("/create-instructor")
    @Operation(summary = "Create new course admin/instructor",
            description = "Create a new course admin user with auto-generated secure password (super admin only)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Instructor created with credentials",
                    content = @Content(schema = @Schema(implementation = com.skillforge.dto.CreateInstructorResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid email or email already exists"),
            @ApiResponse(responseCode = "403", description = "Forbidden - super admin role required")
    })
    public ResponseEntity<?> createInstructor(@RequestBody com.skillforge.dto.CreateInstructorRequestDTO request) {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isSuperAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - super admin access required"));
            }
            
            // Validate request
            if (request.getName() == null || request.getName().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Name cannot be empty"));
            }
            if (request.getEmail() == null || request.getEmail().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Email cannot be empty"));
            }
            
            com.skillforge.dto.CreateInstructorResponseDTO response = adminService.createInstructor(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.warn("Instructor creation validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating instructor", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to create instructor"));
        }
    }

    @PostMapping("/create-student")
    @Operation(summary = "Create new student",
            description = "Create a new student user (super admin only)")
    public ResponseEntity<?> createStudent(@RequestBody com.skillforge.dto.CreateInstructorRequestDTO request) {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isSuperAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - super admin access required"));
            }

            if (request.getName() == null || request.getName().isBlank()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Name cannot be empty"));
            }
            if (request.getEmail() == null || request.getEmail().isBlank()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Email cannot be empty"));
            }

            User created = adminService.createStudent(request.getName(), request.getEmail());
            Map<String, Object> response = new HashMap<>();
            response.put("id", created.getId());
            response.put("name", created.getName());
            response.put("email", created.getEmail());
            response.put("message", "Student created successfully");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.warn("Student creation validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating student", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to create student"));
        }
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Delete user",
            description = "Delete a user by ID (super admin only; cannot delete super admin)")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isSuperAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - super admin access required"));
            }

            adminService.deleteUser(userId);
            return ResponseEntity.ok(new SuccessResponse("User deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to delete user"));
        }
    }

    @DeleteMapping("/instructor/{instructorId}")
    @Operation(summary = "Delete instructor",
            description = "Delete instructor by ID (super admin only)")
    public ResponseEntity<?> deleteInstructor(@PathVariable Long instructorId) {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isSuperAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - super admin access required"));
            }

            adminService.deleteInstructor(instructorId);
            return ResponseEntity.ok(new SuccessResponse("Instructor deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting instructor", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to delete instructor"));
        }
    }
    
    /**
     * POST /api/admin/assign-course-admin/{userId}/{courseId}
     * Assign a course to a course admin (super admin only)
     */
    @PostMapping("/assign-course-admin/{userId}/{courseId}")
    @Operation(summary = "Assign course to admin",
            description = "Assign a course to a course admin user (super admin only)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Course assigned successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid user or course"),
            @ApiResponse(responseCode = "403", description = "Forbidden - super admin role required")
    })
    public ResponseEntity<?> assignCourseToAdmin(
            @PathVariable Long userId,
            @PathVariable Long courseId) {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isSuperAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - super admin access required"));
            }
            
            adminService.assignCourseToAdmin(userId, courseId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new SuccessResponse("Course assigned to admin successfully"));
        } catch (IllegalArgumentException e) {
            log.warn("Course assignment validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error assigning course to admin", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to assign course"));
        }
    }
    
    /**
     * GET /api/admin/my-courses
     * Get courses assigned to current admin
     */
    @GetMapping("/my-courses")
    @Operation(summary = "Get assigned courses",
            description = "Get all courses assigned to the current admin user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of assigned courses"),
            @ApiResponse(responseCode = "403", description = "Forbidden - admin role required")
    })
    public ResponseEntity<?> getAdminCourses() {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - admin access required"));
            }
            
            List<CourseDTO> courses = adminService.getCoursesForAdmin(user.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("count", courses.size());
            response.put("courses", courses);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching admin courses", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch courses"));
        }
    }

    @PutMapping("/courses/{courseId}")
    @Operation(summary = "Update course",
            description = "Update course details (super admin or assigned course admin)")
    public ResponseEntity<?> updateCourse(@PathVariable Long courseId, @RequestBody CourseDTO courseDTO) {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.canManageCourse(user, courseId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - cannot manage this course"));
            }

            CourseDTO updated = courseService.updateCourse(courseId, courseDTO);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating course", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to update course"));
        }
    }
    
    /**
     * GET /api/admin/doubts
     * Get all doubts (super admin) or course-specific doubts (course admin)
     */
    @GetMapping("/doubts")
    @Operation(summary = "Get doubts",
            description = "Get all doubts or course-specific doubts based on user role")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of doubts"),
            @ApiResponse(responseCode = "403", description = "Forbidden - admin role required")
    })
    public ResponseEntity<?> getDoubts(
            @Parameter(description = "Course ID filter (for course admins)")
            @RequestParam(required = false) Long courseId) {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - admin access required"));
            }
            
            List<DoubtDTO> doubts;
            if (authorizationUtil.isSuperAdmin(user)) {
                // Super admin can see all doubts or filter by course
                doubts = doubtService.getAllDoubts(courseId);
            } else {
                // Course admin sees doubts for assigned courses
                doubts = doubtService.getDoubtsForCourseAdmin(user.getId(), courseId);
            }
            
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
     * POST /api/admin/doubts/{doubtId}/reply
     * Reply to a doubt (admin only)
     */
    @PostMapping("/doubts/{doubtId}/reply")
    @Operation(summary = "Reply to a doubt",
            description = "Reply to a student doubt and mark as resolved")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reply added successfully"),
            @ApiResponse(responseCode = "404", description = "Doubt not found"),
            @ApiResponse(responseCode = "403", description = "Forbidden - admin role required")
    })
    public ResponseEntity<?> replyToDoubt(
            @PathVariable Long doubtId,
            @RequestBody ReplyRequest request) {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - admin access required"));
            }
            
            DoubtDTO doubt = doubtService.replyToDoubt(doubtId, request.getReply(), user.getId());
            return ResponseEntity.ok(new SuccessResponse("Reply added successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error replying to doubt", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to reply to doubt"));
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
    
    // Helper classes for requests and responses
    
    public static class ReplyRequest {
        private String reply;
        
        public ReplyRequest() {}
        
        public ReplyRequest(String reply) {
            this.reply = reply;
        }
        
        public String getReply() {
            return reply;
        }
        
        public void setReply(String reply) {
            this.reply = reply;
        }
    }
    
    public static class SuccessResponse {
        private String message;
        
        public SuccessResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
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
